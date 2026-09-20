import { buildPaginationMeta, generateReferenceNumber, normalizePagination } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type {
  BusinessScopedQueryInput,
  CreateCommissionRuleInput,
  CreatePayoutInput,
  PayoutStatusUpdateInput,
} from "./financial.validation.js";

const requireAdminOwnsBusiness = async (userId: string, businessId: string) => {
  const business = await prisma.business.findFirst({
    where: { id: businessId, admin: { userId }, deletedAt: null },
  });
  if (!business) {
    throw new AppError(403, "You do not manage this business");
  }
  return business;
};

const MAX_NUMBER_ATTEMPTS = 5;

const generateUniquePayoutReference = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt += 1) {
    const candidate = generateReferenceNumber("PO");
    const exists = await prisma.businessPayout.findUnique({
      where: { payoutReference: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }
  throw new AppError(500, "Could not generate a unique payout reference");
};

export const financialService = {
  // -- commission rules --------------------------------------------------
  async createCommissionRule(input: CreateCommissionRuleInput) {
    return prisma.businessCommissionRule.create({ data: { ...input, isActive: true } });
  },

  async listCommissionRules(businessId?: string) {
    return prisma.businessCommissionRule.findMany({
      where: businessId ? { OR: [{ businessId }, { businessId: null }] } : undefined,
      orderBy: { effectiveFrom: "desc" },
    });
  },

  // -- transactions (read-only ledger; rows are written by the
  // payment/booking/order completion flow once that integration lands —
  // see project roadmap) -------------------------------------------------
  async listTransactionsForAdmin(userId: string, query: BusinessScopedQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.BusinessTransactionWhereInput = {
      business: { admin: { userId } },
      ...(query.businessId ? { businessId: query.businessId } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.businessTransaction.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.businessTransaction.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listTransactionsForSuperAdmin(query: BusinessScopedQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.BusinessTransactionWhereInput = query.businessId
      ? { businessId: query.businessId }
      : {};
    const [items, total] = await Promise.all([
      prisma.businessTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { business: true },
      }),
      prisma.businessTransaction.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  // -- payouts -------------------------------------------------------
  async createPayout(input: CreatePayoutInput) {
    const payoutReference = await generateUniquePayoutReference();
    return prisma.businessPayout.create({
      data: { ...input, payoutReference, status: "PENDING" },
    });
  },

  async listPayoutsForAdmin(userId: string, businessId: string, query: BusinessScopedQueryInput) {
    await requireAdminOwnsBusiness(userId, businessId);
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.BusinessPayoutWhereInput = { businessId };
    const [items, total] = await Promise.all([
      prisma.businessPayout.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.businessPayout.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listPayoutsForSuperAdmin(query: BusinessScopedQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.BusinessPayoutWhereInput = query.businessId
      ? { businessId: query.businessId }
      : {};
    const [items, total] = await Promise.all([
      prisma.businessPayout.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { business: true },
      }),
      prisma.businessPayout.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async updatePayoutStatus(payoutId: string, input: PayoutStatusUpdateInput) {
    const payout = await prisma.businessPayout.findUnique({ where: { id: payoutId } });
    if (!payout) {
      throw new AppError(404, "Payout not found");
    }
    return prisma.businessPayout.update({
      where: { id: payoutId },
      data: {
        status: input.status,
        ...(input.status === "COMPLETED" ? { processedAt: new Date() } : {}),
        ...(input.status === "FAILED" ? { failureReason: input.failureReason } : {}),
      },
    });
  },
};
