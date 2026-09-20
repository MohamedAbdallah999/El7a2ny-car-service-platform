import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createCommissionRuleSchema = z
  .object({
    businessId: uuidSchema.optional(),
    serviceCommissionPercent: z.coerce.number().min(0).max(100),
    productCommissionPercent: z.coerce.number().min(0).max(100),
    fixedFee: z.coerce.number().min(0).optional(),
    effectiveFrom: z.coerce.date(),
    effectiveUntil: z.coerce.date().optional(),
  })
  .strict();

export const createPayoutSchema = z
  .object({
    businessId: uuidSchema,
    amount: z.coerce.number().positive(),
  })
  .strict();

export const payoutStatusUpdateSchema = z
  .object({
    status: z.enum(["PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]),
    failureReason: z.string().trim().max(1000).optional(),
  })
  .strict();

export const businessScopedQuerySchema = paginationQuerySchema
  .extend({ businessId: uuidSchema.optional() })
  .strict();

export type CreateCommissionRuleInput = z.infer<
  typeof createCommissionRuleSchema
>;
export type CreatePayoutInput = z.infer<typeof createPayoutSchema>;
export type PayoutStatusUpdateInput = z.infer<typeof payoutStatusUpdateSchema>;
export type BusinessScopedQueryInput = z.infer<
  typeof businessScopedQuerySchema
>;
