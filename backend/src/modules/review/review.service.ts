import { buildPaginationMeta, normalizePagination } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import type {
  BusinessReviewListQueryInput,
  CreateBusinessReviewInput,
  CreateProductReviewInput,
  ProductReviewListQueryInput,
  ReplyToReviewInput,
  ReviewStatusUpdateInput,
} from "./review.validation.js";

const requireCustomerId = async (userId: string): Promise<string> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!customer) {
    throw new AppError(403, "Only customer accounts can leave reviews");
  }
  return customer.id;
};

const recomputeBusinessRating = async (businessId: string) => {
  const aggregate = await prisma.businessReview.aggregate({
    where: { businessId, status: "PUBLISHED" },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.business.update({
    where: { id: businessId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      totalReviews: aggregate._count,
    },
  });
};

export const reviewService = {
  async createBusinessReview(userId: string, input: CreateBusinessReviewInput) {
    const customerId = await requireCustomerId(userId);

    if (input.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId },
      });
      if (!booking || booking.customerId !== customerId) {
        throw new AppError(400, "Booking not found");
      }
      if (booking.businessId !== input.businessId) {
        throw new AppError(400, "Booking does not belong to this business");
      }
      if (booking.status !== "COMPLETED") {
        throw new AppError(400, "Only a completed booking can be reviewed");
      }
    }

    const { images, ...rest } = input;
    try {
      return await prisma.businessReview.create({
        data: {
          ...rest,
          customerId,
          status: "PENDING",
          images: images?.length
            ? { create: images.map((imageUrl) => ({ imageUrl })) }
            : undefined,
        },
        include: { images: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(409, "This booking has already been reviewed");
      }
      throw error;
    }
  },

  async createProductReview(userId: string, input: CreateProductReviewInput) {
    const customerId = await requireCustomerId(userId);

    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { items: true },
    });
    if (!order || order.customerId !== customerId) {
      throw new AppError(400, "Order not found");
    }
    if (!["DELIVERED", "COMPLETED"].includes(order.status)) {
      throw new AppError(400, "Only a delivered order can be reviewed");
    }
    if (!order.items.some((item) => item.productId === input.productId)) {
      throw new AppError(400, "This product was not part of the order");
    }

    const { images, ...rest } = input;
    return prisma.productReview.create({
      data: {
        ...rest,
        customerId,
        status: "PENDING",
        images: images?.length
          ? { create: images.map((imageUrl) => ({ imageUrl })) }
          : undefined,
      },
      include: { images: true },
    });
  },

  async listBusinessReviews(
    query: BusinessReviewListQueryInput,
    includeAllStatuses: boolean,
  ) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where = {
      businessId: query.businessId,
      ...(includeAllStatuses ? {} : { status: "PUBLISHED" as const }),
    };
    const [items, total] = await Promise.all([
      prisma.businessReview.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { customer: { include: { user: true } }, images: true },
      }),
      prisma.businessReview.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listProductReviews(
    query: ProductReviewListQueryInput,
    includeAllStatuses: boolean,
  ) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where = {
      productId: query.productId,
      ...(includeAllStatuses ? {} : { status: "PUBLISHED" as const }),
    };
    const [items, total] = await Promise.all([
      prisma.productReview.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { customer: { include: { user: true } }, images: true },
      }),
      prisma.productReview.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async replyToBusinessReview(
    userId: string,
    reviewId: string,
    input: ReplyToReviewInput,
  ) {
    const review = await prisma.businessReview.findUnique({
      where: { id: reviewId },
      include: { business: { include: { admin: true } } },
    });
    if (!review) {
      throw new AppError(404, "Review not found");
    }
    if (review.business.admin.userId !== userId) {
      throw new AppError(403, "You do not manage this business");
    }
    return prisma.businessReview.update({
      where: { id: reviewId },
      data: { adminReply: input.adminReply, repliedAt: new Date() },
    });
  },

  async setBusinessReviewStatus(reviewId: string, input: ReviewStatusUpdateInput) {
    const review = await prisma.businessReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new AppError(404, "Review not found");
    }
    const updated = await prisma.businessReview.update({
      where: { id: reviewId },
      data: { status: input.status },
    });
    await recomputeBusinessRating(review.businessId);
    return updated;
  },

  async setProductReviewStatus(reviewId: string, input: ReviewStatusUpdateInput) {
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new AppError(404, "Review not found");
    }
    return prisma.productReview.update({
      where: { id: reviewId },
      data: { status: input.status },
    });
  },
};
