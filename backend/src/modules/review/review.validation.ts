import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

const ratingSchema = z.coerce.number().int().min(1).max(5);

export const createBusinessReviewSchema = z
  .object({
    businessId: uuidSchema,
    bookingId: uuidSchema.optional(),
    rating: ratingSchema,
    title: z.string().trim().max(200).optional(),
    comment: z.string().trim().max(3000).optional(),
    images: z.array(z.string().trim().url().max(2048)).max(10).optional(),
  })
  .strict();

export const createProductReviewSchema = z
  .object({
    productId: uuidSchema,
    orderId: uuidSchema,
    rating: ratingSchema,
    title: z.string().trim().max(200).optional(),
    comment: z.string().trim().max(3000).optional(),
    images: z.array(z.string().trim().url().max(2048)).max(10).optional(),
  })
  .strict();

export const replyToReviewSchema = z
  .object({ adminReply: z.string().trim().min(1).max(2000) })
  .strict();

export const reviewStatusUpdateSchema = z
  .object({ status: z.enum(["PUBLISHED", "HIDDEN", "REJECTED"]) })
  .strict();

export const businessReviewListQuerySchema = paginationQuerySchema
  .extend({ businessId: uuidSchema })
  .strict();

export const productReviewListQuerySchema = paginationQuerySchema
  .extend({ productId: uuidSchema })
  .strict();

export type CreateBusinessReviewInput = z.infer<
  typeof createBusinessReviewSchema
>;
export type CreateProductReviewInput = z.infer<
  typeof createProductReviewSchema
>;
export type ReplyToReviewInput = z.infer<typeof replyToReviewSchema>;
export type ReviewStatusUpdateInput = z.infer<typeof reviewStatusUpdateSchema>;
export type BusinessReviewListQueryInput = z.infer<
  typeof businessReviewListQuerySchema
>;
export type ProductReviewListQueryInput = z.infer<
  typeof productReviewListQuerySchema
>;
