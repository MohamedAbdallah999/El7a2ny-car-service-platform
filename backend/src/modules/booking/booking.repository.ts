import { prisma } from "../../config/database.js";
import type { BookingStatus, Prisma } from "../../generated/prisma/client.js";

export interface BookingListFilters {
  status?: BookingStatus;
  businessId?: string;
  branchId?: string;
  date?: Date;
  from?: Date;
  to?: Date;
}

const NON_BLOCKING_STATUSES: BookingStatus[] = [
  "CANCELLED",
  "REJECTED",
  "NO_SHOW",
];

export const bookingRepository = {
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

  async bookingNumberExists(bookingNumber: string): Promise<boolean> {
    const existing = await prisma.booking.findUnique({
      where: { bookingNumber },
      select: { id: true },
    });
    return existing !== null;
  },

  async requestNumberExists(requestNumber: string): Promise<boolean> {
    const existing = await prisma.serviceRequest.findUnique({
      where: { requestNumber },
      select: { id: true },
    });
    return existing !== null;
  },

  async findOverlapping(
    branchId: string,
    scheduledDate: Date,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ) {
    return prisma.booking.findFirst({
      where: {
        branchId,
        scheduledDate,
        status: { notIn: NON_BLOCKING_STATUSES },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
    });
  },

  create(data: Prisma.BookingUncheckedCreateInput) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({ data });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          oldStatus: null,
          newStatus: booking.status,
          changedByUserId: null,
        },
      });
      return booking;
    });
  },

  createPendingRequest(
    bookingData: Prisma.BookingUncheckedCreateInput,
    requestData: Prisma.ServiceRequestUncheckedCreateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.serviceRequest.create({ data: requestData });
      const booking = await tx.booking.create({
        data: { ...bookingData, serviceRequestId: request.id },
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          oldStatus: null,
          newStatus: booking.status,
          changedByUserId: null,
        },
      });
      return booking;
    });
  },

  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        business: { include: { admin: true } },
        branch: true,
        vehicle: { include: { make: true, model: true } },
        service: true,
        serviceRequest: true,
      },
    });
  },

  reschedule(bookingId: string, data: Prisma.BookingUncheckedUpdateInput) {
    return prisma.booking.update({
      where: { id: bookingId },
      data,
      include: {
        customer: { include: { user: true } },
        branch: true,
        service: true,
        vehicle: { include: { make: true, model: true } },
      },
    });
  },

  async listByCustomer(
    customerId: string,
    filters: BookingListFilters,
    skip: number,
    take: number,
  ) {
    const where: Prisma.BookingWhereInput = {
      customerId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.from || filters.to
        ? {
            scheduledDate: {
              ...(filters.from ? { gte: filters.from } : {}),
              ...(filters.to ? { lte: filters.to } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledDate: "desc" },
        include: { business: true, branch: true, service: true, vehicle: true },
      }),
      prisma.booking.count({ where }),
    ]);
    return { items, total };
  },

  async listByAdmin(
    adminId: string,
    filters: BookingListFilters,
    skip: number,
    take: number,
  ) {
    const where: Prisma.BookingWhereInput = {
      business: { adminId },
      ...(filters.status ? { status: filters.status } : {}),
      ...(!filters.status
        ? {
            status: {
              in: ["CONFIRMED", "ARRIVED", "IN_PROGRESS", "COMPLETED"],
            },
          }
        : {}),
      ...(filters.businessId ? { businessId: filters.businessId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.date
        ? { scheduledDate: filters.date }
        : filters.from || filters.to
          ? {
              scheduledDate: {
                ...(filters.from ? { gte: filters.from } : {}),
                ...(filters.to ? { lte: filters.to } : {}),
              },
            }
          : {}),
    };

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledDate: "asc" },
        include: {
          customer: { include: { user: true } },
          branch: true,
          service: true,
          vehicle: { include: { make: true, model: true } },
          serviceRequest: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);
    return { items, total };
  },

  async transitionStatus(
    bookingId: string,
    changedByUserId: string | null,
    oldStatus: BookingStatus,
    newStatus: BookingStatus,
    reason: string | undefined,
    extra: Prisma.BookingUpdateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUniqueOrThrow({
        where: { id: bookingId },
        select: { serviceRequestId: true },
      });
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: newStatus, ...extra },
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId, oldStatus, newStatus, changedByUserId, reason },
      });
      if (existing.serviceRequestId) {
        const linkedStatus =
          newStatus === "IN_PROGRESS"
            ? "IN_PROGRESS"
            : newStatus === "COMPLETED"
              ? "COMPLETED"
              : newStatus === "CANCELLED"
                ? "CANCELLED"
                : null;
        if (linkedStatus) {
          await tx.serviceRequest.update({
            where: { id: existing.serviceRequestId },
            data: {
              status: linkedStatus,
              ...(linkedStatus === "COMPLETED"
                ? { completedAt: new Date(), finalPrice: booking.finalPrice }
                : {}),
              ...(linkedStatus === "CANCELLED"
                ? { cancelledAt: new Date() }
                : {}),
            },
          });
        }
      }
      return booking;
    });
  },

  listHistory(bookingId: string) {
    return prisma.bookingStatusHistory.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
      include: { changedBy: true },
    });
  },
};
