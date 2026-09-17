import {
  FUEL_TYPE_VALUES,
  TRANSMISSION_TYPE_VALUES,
} from "@car-platform/constants";
import { z } from "@car-platform/validation";

const currentYear = new Date().getFullYear();

export const createMakeSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    logoUrl: z.string().trim().url().max(2048).optional(),
  })
  .strict();

export const updateMakeSchema = createMakeSchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .strict();

export const createModelSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
  })
  .strict();

export const updateModelSchema = createModelSchema
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .strict();

export const createVehicleSchema = z
  .object({
    makeId: z.string().uuid(),
    modelId: z.string().uuid(),
    year: z.coerce.number().int().min(1900).max(currentYear + 1),
    trim: z.string().trim().max(100).optional(),
    color: z.string().trim().max(50).optional(),
    licensePlate: z.string().trim().max(30).optional(),
    vin: z.string().trim().max(50).optional(),
    mileage: z.coerce.number().int().min(0).optional(),
    fuelType: z.enum(FUEL_TYPE_VALUES).optional(),
    transmission: z.enum(TRANSMISSION_TYPE_VALUES).optional(),
    nickname: z.string().trim().max(100).optional(),
    imageUrl: z.string().trim().url().max(2048).optional(),
    isPrimary: z.boolean().optional(),
  })
  .strict();

export const updateVehicleSchema = createVehicleSchema.partial().strict();

export type CreateMakeInput = z.infer<typeof createMakeSchema>;
export type UpdateMakeInput = z.infer<typeof updateMakeSchema>;
export type CreateModelInput = z.infer<typeof createModelSchema>;
export type UpdateModelInput = z.infer<typeof updateModelSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
