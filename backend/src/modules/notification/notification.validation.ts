import { PUSH_PLATFORM_VALUES } from "@car-platform/constants";
import { paginationQuerySchema, z } from "@car-platform/validation";

export const notificationListQuerySchema = paginationQuerySchema
  .extend({ unreadOnly: z.coerce.boolean().optional() })
  .strict();

export const registerPushDeviceSchema = z
  .object({
    deviceToken: z.string().trim().min(1).max(255),
    platform: z.enum(PUSH_PLATFORM_VALUES),
    deviceId: z.string().trim().max(255).optional(),
  })
  .strict();

export type NotificationListQueryInput = z.infer<
  typeof notificationListQuerySchema
>;
export type RegisterPushDeviceInput = z.infer<typeof registerPushDeviceSchema>;
