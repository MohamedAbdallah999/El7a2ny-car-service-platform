import { phoneSchema, z } from "@car-platform/validation";

export const createAddressSchema = z
  .object({
    label: z.string().trim().max(100).optional(),
    recipientName: z.string().trim().min(1).max(200),
    phone: phoneSchema,
    addressLine1: z.string().trim().min(1),
    addressLine2: z.string().trim().optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().max(100).optional(),
    country: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().max(20).optional(),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateAddressSchema = createAddressSchema.partial().strict();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
