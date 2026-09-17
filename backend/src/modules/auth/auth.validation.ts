import { z } from "zod";

const bcryptMaximumBytes = 72;

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in E.164 format");

const emailSchema = z
  .string()
  .trim()
  .email()
  .max(255)
  .transform((value) => value.toLowerCase());

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
    email: emailSchema,
    password: passwordSchema,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    phone: phoneSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1)
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= bcryptMaximumBytes,
        "Invalid password",
      ),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const verificationCodeSchema = z
  .string()
  .regex(/^\d{4,10}$/, "Verification code must contain 4 to 10 digits");

export const registrationVerificationSchema = z
  .object({
    registrationId: z.string().uuid(),
    code: verificationCodeSchema,
  })
  .strict();

export const loginVerificationSchema = z
  .object({
    challengeToken: z.string().min(43).max(64),
    code: verificationCodeSchema,
  })
  .strict();

export const adminRegistrationSchema = registerSchema
  .extend({ invitationToken: z.string().min(43).max(64) })
  .strict();

export const adminInvitationSchema = z
  .object({
    email: emailSchema,
    phone: phoneSchema,
  })
  .strict();

export type AdminRegistrationInput = z.infer<typeof adminRegistrationSchema>;
export type RegistrationVerificationInput = z.infer<
  typeof registrationVerificationSchema
>;
export type LoginVerificationInput = z.infer<typeof loginVerificationSchema>;
export type AdminInvitationInput = z.infer<typeof adminInvitationSchema>;
