import { prisma } from "../../config/database.js";
import type {
  BookingStatus,
  Prisma,
} from "../../generated/prisma/client.js";

export interface BookingListFilters {
  status?: BookingStatus;
  businessId?: string;
  branchId?: string;
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

  async findOverlapping(
    branchId: string,
    scheduledDate: Date,
    startTime: Date,
    endTime: Date,
  ) {
    return prisma.booking.findFirst({
      where: {
        branchId,
        scheduledDate,
        status: { notIn: NON_BLOCKING_STATUSES },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
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

  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        business: { include: { admin: true } },
        branch: true,
        vehicle: { include: { make: true, model: true } },
        service: true,
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
      ...(filters.businessId ? { businessId: filters.businessId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
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
        orderBy: { scheduledDate: "asc" },
        include: { customer: { include: { user: true } }, branch: true, service: true, vehicle: true },
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
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: newStatus, ...extra },
      });
      await tx.bookingStatusHistory.create({
        data: { bookingId, oldStatus, newStatus, changedByUserId, reason },
      });
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
