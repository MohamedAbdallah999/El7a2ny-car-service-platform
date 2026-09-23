import { prisma } from "../../config/database.js";
import type {
  Prisma,
  ServiceRequestStatus,
} from "../../generated/prisma/client.js";

export interface ServiceRequestListFilters {
  status?: ServiceRequestStatus;
  businessId?: string;
}

export const serviceRequestRepository = {
  findCustomerIdByUserId(userId: string) {
    return prisma.customer
      .findUnique({ where: { userId }, select: { id: true } })
      .then((customer) => customer?.id ?? null);
  },

  findAdminIdByUserId(userId: string) {
    return prisma.admin
      .findUnique({ where: { userId }, select: { id: true } })
      .then((admin) => admin?.id ?? null);
  },

  async requestNumberExists(requestNumber: string): Promise<boolean> {
    const existing = await prisma.serviceRequest.findUnique({
      where: { requestNumber },
      select: { id: true },
    });
    return existing !== null;
  },

  create(data: Prisma.ServiceRequestUncheckedCreateInput) {
    return prisma.serviceRequest.create({ data });
  },

  findById(id: string) {
    return prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        customer: true,
        business: { include: { admin: true } },
        vehicle: { include: { make: true, model: true } },
        service: true,
        booking: true,
      },
    });
  },

  async listByCustomer(
    customerId: string,
    filters: ServiceRequestListFilters,
    skip: number,
    take: number,
  ) {
    const where: Prisma.ServiceRequestWhereInput = {
      customerId,
      ...(filters.status ? { status: filters.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { business: true, vehicle: true, service: true },
      }),
      prisma.serviceRequest.count({ where }),
    ]);
    return { items, total };
  },

  async listByAdmin(
    adminId: string,
    filters: ServiceRequestListFilters,
    skip: number,
    take: number,
  ) {
    const where: Prisma.ServiceRequestWhereInput = {
      business: { adminId },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.businessId ? { businessId: filters.businessId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { include: { user: true } },
          vehicle: { include: { make: true, model: true } },
          service: true,
          booking: true,
        },
      }),
      prisma.serviceRequest.count({ where }),
    ]);
    return { items, total };
  },

  update(id: string, data: Prisma.ServiceRequestUpdateInput) {
    return prisma.serviceRequest.update({ where: { id }, data });
  },

  async acceptPending(
    requestId: string,
    bookingId: string,
    changedByUserId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.serviceRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: { status: "APPROVED" },
      });
      if (updated.count !== 1) throw new Error("REQUEST_NOT_PENDING");

      const booking = await tx.booking.findUniqueOrThrow({
        where: { id: bookingId },
      });
      if (booking.status !== "PENDING") throw new Error("BOOKING_NOT_PENDING");
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          oldStatus: booking.status,
          newStatus: "CONFIRMED",
          changedByUserId,
        },
      });
      return tx.serviceRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: { booking: true, service: true },
      });
    });
  },

  async rejectPending(
    requestId: string,
    bookingId: string | undefined,
    changedByUserId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.serviceRequest.updateMany({
        where: { id: requestId, status: "PENDING" },
        data: { status: "REJECTED", cancelledAt: new Date() },
      });
      if (updated.count !== 1) throw new Error("REQUEST_NOT_PENDING");

      if (bookingId) {
        const booking = await tx.booking.findUniqueOrThrow({
          where: { id: bookingId },
        });
        if (booking.status === "PENDING") {
          await tx.booking.update({
            where: { id: bookingId },
            data: { status: "REJECTED", cancelledAt: new Date() },
          });
          await tx.bookingStatusHistory.create({
            data: {
              bookingId,
              oldStatus: booking.status,
              newStatus: "REJECTED",
              changedByUserId,
            },
          });
        }
      }
      return tx.serviceRequest.findUniqueOrThrow({
        where: { id: requestId },
        include: { booking: true, service: true },
      });
    });
  },

  createMessage(
    serviceRequestId: string,
    senderUserId: string,
    message: string,
  ) {
    return prisma.serviceRequestMessage.create({
      data: { serviceRequestId, senderUserId, message },
    });
  },

  listMessages(serviceRequestId: string) {
    return prisma.serviceRequestMessage.findMany({
      where: { serviceRequestId },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });
  },

  createAttachment(
    serviceRequestId: string,
    data: { fileUrl: string; fileName: string; fileType?: string },
  ) {
    return prisma.serviceRequestAttachment.create({
      data: { ...data, serviceRequestId },
    });
  },

  listAttachments(serviceRequestId: string) {
    return prisma.serviceRequestAttachment.findMany({
      where: { serviceRequestId },
      orderBy: { createdAt: "desc" },
    });
  },
};
