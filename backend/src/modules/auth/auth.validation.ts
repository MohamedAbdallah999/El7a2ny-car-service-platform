import { PASSWORD_MAX_BYTES } from "@car-platform/constants";
import {
  emailSchema,
  opaqueTokenSchema,
  passwordSchema,
  phoneSchema,
  uuidSchema,
  verificationCodeSchema,
  z,
} from "@car-platform/validation";

export { passwordSchema, verificationCodeSchema };

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
        (value) => Buffer.byteLength(value, "utf8") <= PASSWORD_MAX_BYTES,
        "Invalid password",
      ),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const registrationVerificationSchema = z
  .object({
    registrationId: uuidSchema,
    code: verificationCodeSchema,
  })
  .strict();

export const loginVerificationSchema = z
  .object({
    challengeToken: opaqueTokenSchema,
    code: verificationCodeSchema,
  })
  .strict();

export const adminRegistrationSchema = registerSchema
  .extend({ invitationToken: opaqueTokenSchema })
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

export const forgotPasswordSchema = z
  .object({ email: emailSchema })
  .strict();

export const resetPasswordSchema = z
  .object({
    resetToken: opaqueTokenSchema,
    code: verificationCodeSchema,
    newPassword: passwordSchema,
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
