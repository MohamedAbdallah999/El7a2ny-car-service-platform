import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(2000).optional(),
    iconUrl: z.string().trim().url().max(2048).optional(),
    imageUrl: z.string().trim().url().max(2048).optional(),
    parentId: uuidSchema.optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const updateCategorySchema = createCategorySchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .strict();

export const createServiceSchema = z
  .object({
    businessId: uuidSchema,
    branchId: uuidSchema.optional(),
    categoryId: uuidSchema,
    name: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional(),
    durationMinutes: z.coerce.number().int().min(1).max(1440),
    basePrice: z.coerce.number().min(0),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    isOnlineBooking: z.boolean().optional(),
    requiresInspection: z.boolean().optional(),
  })
  .strict();

export const updateServiceSchema = createServiceSchema
  .partial()
  .omit({ businessId: true })
  .extend({ isActive: z.boolean().optional() })
  .strict();

export const serviceListQuerySchema = paginationQuerySchema
  .extend({
    businessId: uuidSchema.optional(),
    branchId: uuidSchema.optional(),
    categoryId: uuidSchema.optional(),
    search: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

export const createCompatibilitySchema = z
  .object({
    makeId: uuidSchema.optional(),
    modelId: uuidSchema.optional(),
    yearFrom: z.coerce.number().int().min(1900).optional(),
    yearTo: z.coerce.number().int().min(1900).optional(),
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceListQueryInput = z.infer<typeof serviceListQuerySchema>;
export type CreateCompatibilityInput = z.infer<
  typeof createCompatibilitySchema
>;
