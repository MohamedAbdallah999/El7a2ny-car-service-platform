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
          vehicle: true,
          service: true,
        },
      }),
      prisma.serviceRequest.count({ where }),
    ]);
    return { items, total };
  },

  update(id: string, data: Prisma.ServiceRequestUpdateInput) {
    return prisma.serviceRequest.update({ where: { id }, data });
  },

  createMessage(serviceRequestId: string, senderUserId: string, message: string) {
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
