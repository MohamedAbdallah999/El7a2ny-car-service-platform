import { buildPaginationMeta, normalizePagination } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma, UserRole } from "../../generated/prisma/client.js";
import type {
  CreateDisputeAttachmentInput,
  CreateDisputeInput,
  CreateDisputeMessageInput,
  DisputeListQueryInput,
  DisputeStatusUpdateInput,
} from "./dispute.validation.js";

const requireCustomerId = async (userId: string): Promise<string> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!customer) {
    throw new AppError(403, "Only customer accounts can open disputes");
  }
  return customer.id;
};

const requireAdminId = async (userId: string): Promise<string> => {
  const admin = await prisma.admin.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!admin) {
    throw new AppError(403, "Only admin accounts manage disputes");
  }
  return admin.id;
};

const DISPUTE_INCLUDE = {
  customer: { include: { user: true } },
  business: { include: { admin: true } },
} satisfies Prisma.DisputeInclude;

export const disputeService = {
  async create(userId: string, input: CreateDisputeInput) {
    const customerId = await requireCustomerId(userId);
    let businessId: string | undefined;

    if (input.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: { items: true },
      });
      if (!order || order.customerId !== customerId) {
        throw new AppError(400, "Order not found");
      }
      businessId = order.items[0]?.businessId;
    }
    if (input.bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || booking.customerId !== customerId) {
        throw new AppError(400, "Booking not found");
      }
      businessId = booking.businessId;
    }
    if (input.serviceRequestId) {
      const request = await prisma.serviceRequest.findUnique({
        where: { id: input.serviceRequestId },
      });
      if (!request || request.customerId !== customerId) {
        throw new AppError(400, "Service request not found");
      }
      businessId = request.businessId ?? undefined;
    }

    return prisma.dispute.create({
      data: { ...input, customerId, businessId, status: "OPEN" },
      include: DISPUTE_INCLUDE,
    });
  },

  async listMine(userId: string, query: DisputeListQueryInput) {
    const customerId = await requireCustomerId(userId);
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.DisputeWhereInput = {
      customerId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.dispute.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: DISPUTE_INCLUDE }),
      prisma.dispute.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listForBusiness(userId: string, query: DisputeListQueryInput) {
    const adminId = await requireAdminId(userId);
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.DisputeWhereInput = {
      business: { adminId },
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.dispute.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: DISPUTE_INCLUDE }),
      prisma.dispute.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listAll(query: DisputeListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.DisputeWhereInput = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      prisma.dispute.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: DISPUTE_INCLUDE }),
      prisma.dispute.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  assertVisible(
    dispute: { customer: { userId: string }; business: { admin: { userId: string } } | null },
    userId: string,
    role: UserRole,
  ) {
    if (role === "SUPER_ADMIN") return;
    if (role === "CUSTOMER" && dispute.customer.userId === userId) return;
    if (role === "ADMIN" && dispute.business?.admin.userId === userId) return;
    throw new AppError(403, "You cannot view this dispute");
  },

  async getById(userId: string, role: UserRole, disputeId: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: DISPUTE_INCLUDE,
    });
    if (!dispute) {
      throw new AppError(404, "Dispute not found");
    }
    this.assertVisible(dispute, userId, role);
    return dispute;
  },

  async updateStatus(userId: string, disputeId: string, input: DisputeStatusUpdateInput) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) {
      throw new AppError(404, "Dispute not found");
    }
    const data: Prisma.DisputeUpdateInput = { status: input.status };
    if (input.status === "RESOLVED" || input.status === "REJECTED") {
      data.resolution = input.resolution;
      data.resolvedAt = new Date();
      data.resolvedBy = { connect: { id: userId } };
    }
    return prisma.dispute.update({ where: { id: disputeId }, data });
  },

  async addMessage(userId: string, role: UserRole, disputeId: string, input: CreateDisputeMessageInput) {
    const dispute = await this.getById(userId, role, disputeId);
    return prisma.disputeMessage.create({
      data: { disputeId: dispute.id, senderUserId: userId, message: input.message },
    });
  },

  async listMessages(userId: string, role: UserRole, disputeId: string) {
    await this.getById(userId, role, disputeId);
    return prisma.disputeMessage.findMany({
      where: { disputeId },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });
  },

  async addAttachment(
    userId: string,
    role: UserRole,
    disputeId: string,
    input: CreateDisputeAttachmentInput,
  ) {
    const dispute = await this.getById(userId, role, disputeId);
    return prisma.disputeAttachment.create({
      data: { ...input, disputeId: dispute.id, uploadedByUserId: userId },
    });
  },

  async listAttachments(userId: string, role: UserRole, disputeId: string) {
    await this.getById(userId, role, disputeId);
    return prisma.disputeAttachment.findMany({
      where: { disputeId },
      orderBy: { createdAt: "desc" },
    });
  },
};
