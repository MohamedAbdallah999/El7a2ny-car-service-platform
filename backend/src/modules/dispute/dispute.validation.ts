import { DISPUTE_REASON_VALUES, DISPUTE_STATUS_VALUES } from "@car-platform/constants";
import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createDisputeSchema = z
  .object({
    orderId: uuidSchema.optional(),
    bookingId: uuidSchema.optional(),
    serviceRequestId: uuidSchema.optional(),
    reason: z.enum(DISPUTE_REASON_VALUES),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(5000),
  })
  .strict()
  .refine(
    (v) => [v.orderId, v.bookingId, v.serviceRequestId].some((x) => x !== undefined),
    "At least one of orderId, bookingId, or serviceRequestId is required",
  );

export const disputeStatusUpdateSchema = z
  .object({
    status: z.enum(DISPUTE_STATUS_VALUES),
    resolution: z.string().trim().max(3000).optional(),
  })
  .strict();

export const disputeListQuerySchema = paginationQuerySchema
  .extend({ status: z.enum(DISPUTE_STATUS_VALUES).optional() })
  .strict();

export const createDisputeMessageSchema = z
  .object({ message: z.string().trim().min(1).max(4000) })
  .strict();

export const createDisputeAttachmentSchema = z
  .object({
    fileUrl: z.string().trim().url().max(2048),
    fileName: z.string().trim().min(1).max(255),
    fileType: z.string().trim().max(100).optional(),
  })
  .strict();

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type DisputeStatusUpdateInput = z.infer<typeof disputeStatusUpdateSchema>;
export type DisputeListQueryInput = z.infer<typeof disputeListQuerySchema>;
export type CreateDisputeMessageInput = z.infer<typeof createDisputeMessageSchema>;
export type CreateDisputeAttachmentInput = z.infer<
  typeof createDisputeAttachmentSchema
>;
