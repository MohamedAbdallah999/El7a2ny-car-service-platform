import { uuidSchema, z } from "@car-platform/validation";

export const addCartItemSchema = z
  .object({
    productId: uuidSchema,
    quantity: z.coerce.number().int().min(1).max(999),
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.coerce.number().int().min(1).max(999),
  })
  .strict();

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
