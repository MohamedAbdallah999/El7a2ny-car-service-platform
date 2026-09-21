import {
  PASSWORD_MAX_BYTES,
  PASSWORD_MIN_LENGTH,
} from "@car-platform/constants";

export const getPasswordValidationIssues = (value: string): string[] => {
  const issues: string[] = [];
  if (value.length < PASSWORD_MIN_LENGTH) {
    issues.push(
      `Password must contain at least ${PASSWORD_MIN_LENGTH} characters`,
    );
  }
  if (new TextEncoder().encode(value).byteLength > PASSWORD_MAX_BYTES) {
    issues.push(`Password must not exceed ${PASSWORD_MAX_BYTES} UTF-8 bytes`);
  }
  if (!/[a-z]/.test(value)) {
    issues.push("Password must contain a lowercase letter");
  }
  if (!/[A-Z]/.test(value)) {
    issues.push("Password must contain an uppercase letter");
  }
  if (!/[0-9]/.test(value)) {
    issues.push("Password must contain a number");
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    issues.push("Password must contain a special character");
  }
  return issues;
};

export const getPasswordValidationError = (value: string): string | undefined =>
  getPasswordValidationIssues(value)[0];
