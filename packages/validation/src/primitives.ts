import { z } from "zod";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";
import {
  OPAQUE_TOKEN_MAX_LENGTH,
  OPAQUE_TOKEN_MIN_LENGTH,
  PHONE_E164_PATTERN,
  VERIFICATION_CODE_PATTERN,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "@car-platform/constants";
import { getPasswordValidationIssues } from "./password.js";

// Shared, framework-independent Zod primitives. Backend route validation and
// frontend form validation should both build on these instead of redefining
// the same rules, so the two never quietly drift apart.

export const emailSchema = z
  .string()
  .trim()
  .email()
  .max(255)
  .transform((value) => value.toLowerCase());

export const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_E164_PATTERN, "Phone must be in E.164 format")
  .refine((value) => isValidPhoneNumber(value), "Phone number is invalid")
  .transform((value) => parsePhoneNumberFromString(value)!.number);

export const passwordSchema = z.string().superRefine((value, context) => {
  for (const message of getPasswordValidationIssues(value)) {
    context.addIssue({ code: "custom", message });
  }
});

export const verificationCodeSchema = z
  .string()
  .regex(
    VERIFICATION_CODE_PATTERN,
    "Verification code must contain 4 to 10 digits",
  );

export const opaqueTokenSchema = z
  .string()
  .min(OPAQUE_TOKEN_MIN_LENGTH)
  .max(OPAQUE_TOKEN_MAX_LENGTH);

export const uuidSchema = z.string().uuid();

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
