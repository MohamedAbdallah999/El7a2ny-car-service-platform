import { BOOKING_STATUS_VALUES } from "@car-platform/constants";
import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

const timeOfDaySchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

export const createBookingSchema = z
  .object({
    businessId: uuidSchema,
    branchId: uuidSchema,
    serviceId: uuidSchema,
    vehicleId: uuidSchema,
    scheduledDate: z.coerce.date(),
    startTime: timeOfDaySchema,
    customerNotes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const bookingStatusUpdateSchema = z
  .object({
    status: z.enum(BOOKING_STATUS_VALUES),
    reason: z.string().trim().max(1000).optional(),
    finalPrice: z.coerce.number().min(0).optional(),
    businessNotes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const bookingListQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(BOOKING_STATUS_VALUES).optional(),
    businessId: uuidSchema.optional(),
    branchId: uuidSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict();

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingStatusUpdateInput = z.infer<
  typeof bookingStatusUpdateSchema
>;
export type BookingListQueryInput = z.infer<typeof bookingListQuerySchema>;
