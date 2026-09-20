import { buildPaginationMeta, normalizePagination } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import type {
  AttachTargetInput,
  CreatePromotionInput,
  PromotionListQueryInput,
  UpdatePromotionInput,
} from "./promotion.validation.js";

const requireAdminId = async (userId: string): Promise<string> => {
  const admin = await prisma.admin.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!admin) {
    throw new AppError(403, "Only admin accounts manage promotions");
  }
  return admin.id;
};

const loadOwnedOrPlatformPromotion = async (
  promotionId: string,
  userId: string,
  role: "ADMIN" | "SUPER_ADMIN",
) => {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
    include: { business: { include: { admin: true } } },
  });
  if (!promotion) {
    throw new AppError(404, "Promotion not found");
  }
  if (role === "SUPER_ADMIN") return promotion;
  if (!promotion.business || promotion.business.admin.userId !== userId) {
    throw new AppError(403, "You do not manage this promotion");
  }
  return promotion;
};

export const promotionService = {
  async create(
    userId: string,
    role: "ADMIN" | "SUPER_ADMIN",
    input: CreatePromotionInput,
  ) {
    if (input.businessId) {
      if (role !== "ADMIN") {
        throw new AppError(403, "Only a business admin creates a business promotion");
      }
      const adminId = await requireAdminId(userId);
      const business = await prisma.business.findFirst({
        where: { id: input.businessId, adminId, deletedAt: null },
      });
      if (!business) {
        throw new AppError(403, "You do not manage this business");
      }
    } else if (role !== "SUPER_ADMIN") {
      throw new AppError(403, "Only the platform creates a platform-wide promotion");
    }

    try {
      return await prisma.promotion.create({ data: { ...input, isActive: true } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(409, "This promotion code is already in use");
      }
      throw error;
    }
  },

  async update(
    userId: string,
    role: "ADMIN" | "SUPER_ADMIN",
    promotionId: string,
    input: UpdatePromotionInput,
  ) {
    await loadOwnedOrPlatformPromotion(promotionId, userId, role);
    return prisma.promotion.update({ where: { id: promotionId }, data: input });
  },

  async deactivate(userId: string, role: "ADMIN" | "SUPER_ADMIN", promotionId: string) {
    await loadOwnedOrPlatformPromotion(promotionId, userId, role);
    await prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive: false },
    });
  },

  async list(query: PromotionListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.PromotionWhereInput = {
      isActive: true,
      expiresAt: { gt: new Date() },
      ...(query.businessId
        ? { OR: [{ businessId: query.businessId }, { businessId: null }] }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.promotion.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.promotion.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async validateCode(code: string, orderAmount: number) {
    const promotion = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    });
    const now = new Date();
    if (
      !promotion ||
      !promotion.isActive ||
      promotion.startsAt > now ||
      promotion.expiresAt < now
    ) {
      throw new AppError(404, "This promotion code is not valid");
    }
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      throw new AppError(400, "This promotion code has reached its usage limit");
    }
    if (
      promotion.minimumOrderAmount &&
      orderAmount < Number(promotion.minimumOrderAmount)
    ) {
      throw new AppError(
        400,
        `A minimum order amount of ${promotion.minimumOrderAmount} is required for this code`,
      );
    }

    const rawDiscount =
      promotion.discountType === "PERCENTAGE"
        ? (orderAmount * Number(promotion.discountValue)) / 100
        : Number(promotion.discountValue);
    const discountAmount = promotion.maximumDiscountAmount
      ? Math.min(rawDiscount, Number(promotion.maximumDiscountAmount))
      : rawDiscount;

    return { promotion, discountAmount: Math.min(discountAmount, orderAmount) };
  },

  async attachProduct(
    userId: string,
    role: "ADMIN" | "SUPER_ADMIN",
    promotionId: string,
    input: AttachTargetInput,
  ) {
    const promotion = await loadOwnedOrPlatformPromotion(promotionId, userId, role);
    if (input.productId) {
      return prisma.promotionProduct.create({
        data: { promotionId: promotion.id, productId: input.productId },
      });
    }
    return prisma.promotionService.create({
      data: { promotionId: promotion.id, serviceId: input.serviceId as string },
    });
  },
};
