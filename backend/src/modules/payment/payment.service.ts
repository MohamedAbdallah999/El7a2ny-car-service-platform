import {
  buildPaginationMeta,
  generateReferenceNumber,
  normalizePagination,
} from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma, UserRole } from "../../generated/prisma/client.js";
import type {
  CreatePaymentInput,
  CreateRefundInput,
  FailPaymentInput,
  PaymentListQueryInput,
  RefundStatusUpdateInput,
} from "./payment.validation.js";

const requireCustomerId = async (userId: string): Promise<string> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!customer) {
    throw new AppError(403, "Only customer accounts can make payments");
  }
  return customer.id;
};

const requireAdminId = async (userId: string): Promise<string> => {
  const admin = await prisma.admin.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!admin) {
    throw new AppError(403, "Only admin accounts manage payments");
  }
  return admin.id;
};

const PAYMENT_INCLUDE = {
  order: { include: { items: { include: { business: true } } } },
  booking: { include: { business: true } },
  serviceRequest: { include: { business: true } },
  refunds: true,
} satisfies Prisma.PaymentInclude;

type PaymentWithTargets = Prisma.PaymentGetPayload<{ include: typeof PAYMENT_INCLUDE }>;

const MAX_NUMBER_ATTEMPTS = 5;

const generateUniquePaymentReference = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt += 1) {
    const candidate = generateReferenceNumber("PAY");
    const exists = await prisma.payment.findUnique({
      where: { paymentReference: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }
  throw new AppError(500, "Could not generate a unique payment reference");
};

const paymentOwnsBusiness = (
  payment: PaymentWithTargets,
  adminId: string,
): boolean => {
  if (payment.booking && payment.booking.business.adminId === adminId) {
    return true;
  }
  if (
    payment.serviceRequest?.business &&
    payment.serviceRequest.business.adminId === adminId
  ) {
    return true;
  }
  if (payment.order?.items.some((item) => item.business.adminId === adminId)) {
    return true;
  }
  return false;
};

export const paymentService = {
  async create(userId: string, input: CreatePaymentInput) {
    const customerId = await requireCustomerId(userId);
    let amount: number;
    let currency: string;

    if (input.orderId) {
      const order = await prisma.order.findUnique({ where: { id: input.orderId } });
      if (!order || order.customerId !== customerId) {
        throw new AppError(404, "Order not found");
      }
      amount = Number(order.totalAmount);
      currency = order.currency;
    } else if (input.bookingId) {
      const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } });
      if (!booking || booking.customerId !== customerId) {
        throw new AppError(404, "Booking not found");
      }
      amount = Number(booking.finalPrice ?? booking.estimatedPrice);
      currency = booking.currency;
    } else {
      const request = await prisma.serviceRequest.findUnique({
        where: { id: input.serviceRequestId },
      });
      if (!request || request.customerId !== customerId) {
        throw new AppError(404, "Service request not found");
      }
      const price = request.finalPrice ?? request.estimatedPrice;
      if (!price) {
        throw new AppError(400, "This request does not have a price to pay yet");
      }
      amount = Number(price);
      currency = "EGP";
    }

    const paymentReference = await generateUniquePaymentReference();

    return prisma.payment.create({
      data: {
        customerId,
        orderId: input.orderId,
        bookingId: input.bookingId,
        serviceRequestId: input.serviceRequestId,
        paymentReference,
        amount,
        currency,
        method: input.method,
        status: "PENDING",
      },
    });
  },

  async getById(userId: string, role: UserRole, paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { ...PAYMENT_INCLUDE, customer: true },
    });
    if (!payment) {
      throw new AppError(404, "Payment not found");
    }
    if (role === "SUPER_ADMIN") return payment;
    if (role === "CUSTOMER" && payment.customer.userId === userId) return payment;
    if (role === "ADMIN") {
      const adminId = await requireAdminId(userId);
      if (paymentOwnsBusiness(payment, adminId)) return payment;
    }
    throw new AppError(403, "You cannot view this payment");
  },

  async listMine(userId: string, query: PaymentListQueryInput) {
    const customerId = await requireCustomerId(userId);
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.PaymentWhereInput = { customerId };
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: PAYMENT_INCLUDE,
      }),
      prisma.payment.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listForBusiness(userId: string, query: PaymentListQueryInput) {
    const adminId = await requireAdminId(userId);
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.PaymentWhereInput = {
      OR: [
        { booking: { business: { adminId } } },
        { serviceRequest: { business: { adminId } } },
        { order: { items: { some: { business: { adminId } } } } },
      ],
    };
    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { ...PAYMENT_INCLUDE, customer: { include: { user: true } } },
      }),
      prisma.payment.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  // There is no real payment gateway wired up yet (see project roadmap):
  // `confirm`/`fail` stand in for a gateway callback. For CASH, the
  // business confirms receipt in person; for every other method, the
  // customer confirms client-side success. A Super Admin may always
  // override either path.
  async confirm(userId: string, role: UserRole, paymentId: string) {
    const payment = await this.getById(userId, role, paymentId);
    if (payment.status !== "PENDING" && payment.status !== "PROCESSING") {
      throw new AppError(400, "This payment cannot be confirmed");
    }
    if (payment.method === "CASH") {
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        throw new AppError(403, "Only the business confirms a cash payment");
      }
    } else if (role !== "CUSTOMER" && role !== "SUPER_ADMIN") {
      throw new AppError(403, "Only the customer confirms this payment");
    }

    return prisma.payment.update({
      where: { id: paymentId },
      data: { status: "SUCCEEDED", paidAt: new Date() },
    });
  },

  async fail(userId: string, role: UserRole, paymentId: string, input: FailPaymentInput) {
    const payment = await this.getById(userId, role, paymentId);
    if (payment.status !== "PENDING" && payment.status !== "PROCESSING") {
      throw new AppError(400, "This payment cannot be marked as failed");
    }
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        failedAt: new Date(),
        failureReason: input.failureReason,
      },
    });
  },

  async createRefund(
    userId: string,
    role: UserRole,
    paymentId: string,
    input: CreateRefundInput,
  ) {
    const payment = await this.getById(userId, role, paymentId);
    if (role === "ADMIN") {
      const adminId = await requireAdminId(userId);
      if (!paymentOwnsBusiness(payment, adminId)) {
        throw new AppError(403, "You do not manage this payment");
      }
    } else if (role !== "SUPER_ADMIN") {
      throw new AppError(403, "Only the business or platform can issue a refund");
    }

    if (payment.status !== "SUCCEEDED" && payment.status !== "PARTIALLY_REFUNDED") {
      throw new AppError(400, "Only a succeeded payment can be refunded");
    }

    const alreadyRefunded = payment.refunds
      .filter((r) => r.status === "SUCCEEDED" || r.status === "PENDING" || r.status === "PROCESSING")
      .reduce((sum, r) => sum + Number(r.amount), 0);
    if (alreadyRefunded + input.amount > Number(payment.amount)) {
      throw new AppError(400, "Refund amount exceeds the remaining payment balance");
    }

    return prisma.refund.create({
      data: {
        paymentId,
        amount: input.amount,
        reason: input.reason,
        status: "PENDING",
      },
    });
  },

  async updateRefundStatus(
    userId: string,
    role: UserRole,
    refundId: string,
    input: RefundStatusUpdateInput,
  ) {
    if (role !== "SUPER_ADMIN") {
      throw new AppError(403, "Only the platform processes refunds");
    }
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: { payment: { include: { refunds: true } } },
    });
    if (!refund) {
      throw new AppError(404, "Refund not found");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.refund.update({
        where: { id: refundId },
        data: {
          status: input.status,
          ...(input.status === "SUCCEEDED" || input.status === "FAILED"
            ? { processedAt: new Date() }
            : {}),
        },
      });

      if (input.status === "SUCCEEDED") {
        const totalRefunded = refund.payment.refunds
          .filter((r) => r.id !== refundId && r.status === "SUCCEEDED")
          .reduce((sum, r) => sum + Number(r.amount), Number(refund.amount));
        await tx.payment.update({
          where: { id: refund.paymentId },
          data: {
            status:
              totalRefunded >= Number(refund.payment.amount)
                ? "REFUNDED"
                : "PARTIALLY_REFUNDED",
          },
        });
      }

      return result;
    });

    return updated;
  },
};
