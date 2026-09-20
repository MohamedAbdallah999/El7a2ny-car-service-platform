import { PAYMENT_METHOD_VALUES } from "@car-platform/constants";
import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createPaymentSchema = z
  .object({
    orderId: uuidSchema.optional(),
    bookingId: uuidSchema.optional(),
    serviceRequestId: uuidSchema.optional(),
    method: z.enum(PAYMENT_METHOD_VALUES),
  })
  .strict()
  .refine(
    (value) =>
      [value.orderId, value.bookingId, value.serviceRequestId].filter(
        (v) => v !== undefined,
      ).length === 1,
    "Exactly one of orderId, bookingId, or serviceRequestId is required",
  );

export const failPaymentSchema = z
  .object({ failureReason: z.string().trim().max(1000) })
  .strict();

export const paymentListQuerySchema = paginationQuerySchema.strict();

export const createRefundSchema = z
  .object({
    amount: z.coerce.number().positive(),
    reason: z.string().trim().max(1000).optional(),
  })
  .strict();

export const refundStatusUpdateSchema = z
  .object({
    status: z.enum(["PROCESSING", "SUCCEEDED", "FAILED", "CANCELLED"]),
  })
  .strict();

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type FailPaymentInput = z.infer<typeof failPaymentSchema>;
export type PaymentListQueryInput = z.infer<typeof paymentListQuerySchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;
export type RefundStatusUpdateInput = z.infer<typeof refundStatusUpdateSchema>;
