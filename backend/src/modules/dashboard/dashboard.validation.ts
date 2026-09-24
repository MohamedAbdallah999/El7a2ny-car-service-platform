import { z } from "zod";

export const adminCustomersQuerySchema = z
  .object({
    businessId: z.string().uuid().optional(),
  })
  .strict();

export const adminCustomerParamsSchema = z
  .object({
    customerId: z.string().uuid(),
  })
  .strict();
