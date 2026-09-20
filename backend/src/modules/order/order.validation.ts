import { ORDER_STATUS_VALUES, SHIPMENT_STATUS_VALUES } from "@car-platform/constants";
import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const checkoutSchema = z
  .object({
    shippingAddressId: uuidSchema,
    customerNotes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const orderStatusUpdateSchema = z
  .object({
    status: z.enum(ORDER_STATUS_VALUES),
  })
  .strict();

export const orderListQuerySchema = paginationQuerySchema
  .extend({ status: z.enum(ORDER_STATUS_VALUES).optional() })
  .strict();

export const createShipmentSchema = z
  .object({
    trackingNumber: z.string().trim().max(150).optional(),
    carrier: z.string().trim().max(150).optional(),
    estimatedDeliveryAt: z.coerce.date().optional(),
  })
  .strict();

export const shipmentStatusUpdateSchema = z
  .object({ status: z.enum(SHIPMENT_STATUS_VALUES) })
  .strict();

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type OrderListQueryInput = z.infer<typeof orderListQuerySchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type ShipmentStatusUpdateInput = z.infer<
  typeof shipmentStatusUpdateSchema
>;
