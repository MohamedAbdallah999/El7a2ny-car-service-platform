import { z } from "zod";

const bcryptMaximumBytes = 72;

export const passwordSchema = z
  .string()
  .min(12, "Password must contain at least 12 characters")
  .refine(
    (value) => Buffer.byteLength(value, "utf8") <= bcryptMaximumBytes,
    "Password must not exceed 72 UTF-8 bytes",
  )
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(255)
      .transform((value) => value.toLowerCase()),
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: z.string().trim().min(7).max(30).optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(255)
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(1)
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= bcryptMaximumBytes,
        "Invalid password",
      ),
  })
  .strict();
