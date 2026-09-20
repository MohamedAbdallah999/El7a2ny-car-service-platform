import {
  SERVICE_REQUEST_PRIORITY_VALUES,
  SERVICE_REQUEST_STATUS_VALUES,
} from "@car-platform/constants";
import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createServiceRequestSchema = z
  .object({
    vehicleId: uuidSchema,
    businessId: uuidSchema.optional(),
    branchId: uuidSchema.optional(),
    serviceId: uuidSchema.optional(),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    priority: z.enum(SERVICE_REQUEST_PRIORITY_VALUES).optional(),
  })
  .strict();

export const serviceRequestStatusUpdateSchema = z
  .object({
    status: z.enum(SERVICE_REQUEST_STATUS_VALUES),
    estimatedPrice: z.coerce.number().min(0).optional(),
    finalPrice: z.coerce.number().min(0).optional(),
  })
  .strict();

export const serviceRequestListQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(SERVICE_REQUEST_STATUS_VALUES).optional(),
    businessId: uuidSchema.optional(),
  })
  .strict();

export const createMessageSchema = z
  .object({
    message: z.string().trim().min(1).max(4000),
  })
  .strict();

export const createAttachmentSchema = z
  .object({
    fileUrl: z.string().trim().url().max(2048),
    fileName: z.string().trim().min(1).max(255),
    fileType: z.string().trim().max(100).optional(),
  })
  .strict();

export type CreateServiceRequestInput = z.infer<
  typeof createServiceRequestSchema
>;
export type ServiceRequestStatusUpdateInput = z.infer<
  typeof serviceRequestStatusUpdateSchema
>;
export type ServiceRequestListQueryInput = z.infer<
  typeof serviceRequestListQuerySchema
>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
