import { paginationQuerySchema, z } from "@car-platform/validation";

export const auditLogListQuerySchema = paginationQuerySchema
  .extend({
    action: z.string().trim().max(100).optional(),
    entityType: z.string().trim().max(100).optional(),
  })
  .strict();

export const upsertSettingSchema = z
  .object({
    value: z.unknown(),
    description: z.string().trim().max(1000).optional(),
  })
  .strict();

export type AuditLogListQueryInput = z.infer<typeof auditLogListQuerySchema>;
export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>;
