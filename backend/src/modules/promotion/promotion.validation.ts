import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createPromotionSchema = z
  .object({
    businessId: uuidSchema.optional(),
    name: z.string().trim().min(1).max(200),
    code: z
      .string()
      .trim()
      .min(3)
      .max(50)
      .transform((v) => v.toUpperCase()),
    description: z.string().trim().max(2000).optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.coerce.number().positive(),
    minimumOrderAmount: z.coerce.number().min(0).optional(),
    maximumDiscountAmount: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().int().min(1).optional(),
    startsAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
  })
  .strict()
  .refine((v) => v.expiresAt > v.startsAt, "expiresAt must be after startsAt")
  .refine(
    (v) => v.discountType !== "PERCENTAGE" || v.discountValue <= 100,
    "A percentage discount cannot exceed 100",
  );

export const updatePromotionSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    minimumOrderAmount: z.coerce.number().min(0).optional(),
    maximumDiscountAmount: z.coerce.number().min(0).optional(),
    usageLimit: z.coerce.number().int().min(1).optional(),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const promotionListQuerySchema = paginationQuerySchema
  .extend({ businessId: uuidSchema.optional() })
  .strict();

export const attachTargetSchema = z
  .object({ productId: uuidSchema.optional(), serviceId: uuidSchema.optional() })
  .strict()
  .refine(
    (v) => (v.productId ? 1 : 0) + (v.serviceId ? 1 : 0) === 1,
    "Exactly one of productId or serviceId is required",
  );

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type PromotionListQueryInput = z.infer<typeof promotionListQuerySchema>;
export type AttachTargetInput = z.infer<typeof attachTargetSchema>;
