-- Preserve accounts verified by the previous phone-OTP flow when email OTP
-- becomes the authentication requirement.
UPDATE "users"
SET "email_verified" = true
WHERE "phone_verified" = true
  AND "email_verified" = false;
