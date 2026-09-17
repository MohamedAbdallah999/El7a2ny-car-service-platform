// E.164 international phone format: a leading "+", a non-zero first digit,
// then 7 to 14 more digits. Mirrors backend/src/modules/auth/auth.validation.ts.
export const PHONE_E164_PATTERN = /^\+[1-9]\d{7,14}$/;

// SMS verification codes sent through Twilio Verify.
export const VERIFICATION_CODE_PATTERN = /^\d{4,10}$/;

// Opaque tokens (admin invitation tokens, login challenge tokens) are
// base64url-encoded random bytes; length varies with the byte count chosen
// at generation time but always falls in this range.
export const OPAQUE_TOKEN_MIN_LENGTH = 43;
export const OPAQUE_TOKEN_MAX_LENGTH = 64;

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_BYTES = 72;
