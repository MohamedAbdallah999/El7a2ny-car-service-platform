import { INVENTORY_MOVEMENT_TYPE_VALUES } from "@car-platform/constants";
import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createProductCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(2000).optional(),
    imageUrl: z.string().trim().url().max(2048).optional(),
    parentId: uuidSchema.optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
  })
  .strict();

export const updateProductCategorySchema = createProductCategorySchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .strict();

export const createProductSchema = z
  .object({
    businessId: uuidSchema,
    categoryId: uuidSchema,
    sku: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(250),
    description: z.string().trim().max(5000).optional(),
    brand: z.string().trim().max(150).optional(),
    partNumber: z.string().trim().max(150).optional(),
    price: z.coerce.number().min(0),
    compareAtPrice: z.coerce.number().min(0).optional(),
    costPrice: z.coerce.number().min(0).optional(),
    currency: z.string().trim().length(3).optional(),
    weight: z.coerce.number().min(0).optional(),
    isFeatured: z.boolean().optional(),
  })
  .strict();

export const updateProductSchema = createProductSchema
  .partial()
  .omit({ businessId: true })
  .extend({
    status: z
      .enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "DISCONTINUED", "SUSPENDED"])
      .optional(),
  })
  .strict();

export const productListQuerySchema = paginationQuerySchema
  .extend({
    businessId: uuidSchema.optional(),
    categoryId: uuidSchema.optional(),
    brand: z.string().trim().min(1).max(150).optional(),
    search: z.string().trim().min(1).max(200).optional(),
  })
  .strict();

export const addProductImageSchema = z
  .object({
    imageUrl: z.string().trim().url().max(2048),
    altText: z.string().trim().max(255).optional(),
    sortOrder: z.coerce.number().int().min(0).optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

export const addCompatibilitySchema = z
  .object({
    makeId: uuidSchema.optional(),
    modelId: uuidSchema.optional(),
    yearFrom: z.coerce.number().int().min(1900).optional(),
    yearTo: z.coerce.number().int().min(1900).optional(),
    engine: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const createInventorySchema = z
  .object({
    businessId: uuidSchema,
    branchId: uuidSchema,
    productId: uuidSchema,
    quantity: z.coerce.number().int().min(0).default(0),
    lowStockThreshold: z.coerce.number().int().min(0).default(0),
    reorderQuantity: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const adjustInventorySchema = z
  .object({
    type: z.enum(INVENTORY_MOVEMENT_TYPE_VALUES),
    quantity: z.coerce.number().int().refine((v) => v !== 0, "Quantity must not be zero"),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export type CreateProductCategoryInput = z.infer<
  typeof createProductCategorySchema
>;
export type UpdateProductCategoryInput = z.infer<
  typeof updateProductCategorySchema
>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQueryInput = z.infer<typeof productListQuerySchema>;
export type AddProductImageInput = z.infer<typeof addProductImageSchema>;
export type AddCompatibilityInput = z.infer<typeof addCompatibilitySchema>;
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
