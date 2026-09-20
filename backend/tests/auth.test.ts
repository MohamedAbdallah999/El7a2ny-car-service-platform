import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../src/generated/prisma/client.js";
import { authorize } from "../src/middleware/auth.middleware.js";
import {
  adminRegistrationSchema,
  loginSchema,
  passwordSchema,
  registerSchema,
} from "../src/modules/auth/auth.validation.js";
import { signToken, verifyToken } from "../src/modules/auth/auth.token.js";
import {
  comparePassword,
  hashPassword,
} from "../src/modules/auth/auth.password.js";
import { emailVerification } from "../src/modules/auth/auth.email-verification.js";

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

test("JWT round-trips every supported role and rejects tampering", () => {
  for (const role of Object.values(UserRole)) {
    const token = signToken({
      userId: "00000000-0000-4000-8000-000000000001",
      role,
    });

    assert.equal(verifyToken(token).role, role);
    assert.throws(() => verifyToken(`${token}tampered`));
  }
});

test("password hashing verifies the password and rejects a different password", async () => {
  const hash = await hashPassword("Correct-Horse-42!");

  assert.equal(await comparePassword("Correct-Horse-42!", hash), true);
  assert.equal(await comparePassword("Wrong-Horse-42!", hash), false);
});

test("local email verification returns and validates the development code", async () => {
  process.env.EMAIL_VERIFICATION_PROVIDER = "local";
  process.env.LOCAL_EMAIL_VERIFICATION_CODE = "654321";

  const result = await emailVerification.sendCode("user@example.com");

  assert.equal(result.developmentVerificationCode, "654321");
  assert.equal(
    await emailVerification.checkCode("user@example.com", "654321"),
    true,
  );
  assert.equal(
    await emailVerification.checkCode("user@example.com", "000000"),
    false,
  );
});

test("Resend email verification sends and validates a server-generated code", async () => {
  const originalFetch = globalThis.fetch;
  const originalProvider = process.env.EMAIL_VERIFICATION_PROVIDER;
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM_EMAIL;
  let requestBody: Record<string, unknown> | undefined;

  process.env.EMAIL_VERIFICATION_PROVIDER = "resend";
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM_EMAIL = "El7a2ny <noreply@example.com>";
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ id: "email-id" }), { status: 200 });
  };

  try {
    const result = await emailVerification.sendCode("user@example.com");
    const text = String(requestBody?.text);
    const code = text.match(/\b\d{6}\b/)?.[0];

    assert.equal(result.developmentVerificationCode, undefined);
    assert.deepEqual(requestBody?.to, ["user@example.com"]);
    assert.ok(code);
    assert.equal(
      await emailVerification.checkCode("user@example.com", code),
      true,
    );
    assert.equal(
      await emailVerification.checkCode("different@example.com", code),
      false,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalProvider === undefined) {
      delete process.env.EMAIL_VERIFICATION_PROVIDER;
    } else {
      process.env.EMAIL_VERIFICATION_PROVIDER = originalProvider;
    }
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    if (originalFrom === undefined) {
      delete process.env.RESEND_FROM_EMAIL;
    } else {
      process.env.RESEND_FROM_EMAIL = originalFrom;
    }
  }
});

test("authentication schemas normalize email and reject unknown or oversized input", () => {
  const registration = registerSchema.parse({
    email: "  USER@Example.COM ",
    password: "Correct-Horse-42!",
    firstName: " Test ",
    lastName: " User ",
    phone: "+201000000000",
  });

  assert.equal(registration.email, "user@example.com");
  assert.equal(registration.firstName, "Test");
  assert.equal(registration.phone, "+201000000000");
  assert.equal(
    registerSchema.safeParse({ ...registration, unexpected: true }).success,
    false,
  );
  assert.equal(
    passwordSchema.safeParse(`Aa1!${"é".repeat(35)}`).success,
    false,
  );
  assert.equal(
    loginSchema.safeParse({
      email: "user@example.com",
      password: "x".repeat(73),
    }).success,
    false,
  );
  assert.equal(
    registerSchema.safeParse({
      email: "user@example.com",
      password: "Correct-Horse-42!",
      firstName: "Test",
      lastName: "User",
    }).success,
    false,
  );
  assert.equal(
    adminRegistrationSchema.safeParse({
      ...registration,
      invitationToken: "too-short",
    }).success,
    false,
  );
});

test("authorization allows only explicitly permitted roles", () => {
  for (const currentRole of Object.values(UserRole)) {
    for (const allowedRole of Object.values(UserRole)) {
      let status: number | undefined;
      let nextCalled = false;
      const request = { user: { id: "user-id", role: currentRole } } as Request;
      const response = {
        status(code: number) {
          status = code;
          return this;
        },
        json() {
          return this;
        },
      } as unknown as Response;
      const next = (() => {
        nextCalled = true;
      }) as NextFunction;

      authorize(allowedRole)(request, response, next);

      assert.equal(nextCalled, currentRole === allowedRole);
      assert.equal(status, currentRole === allowedRole ? undefined : 403);
    }
  }
});

test("authorization rejects unauthenticated requests", () => {
  let status: number | undefined;
  const response = {
    status(code: number) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;

  authorize(UserRole.CUSTOMER)(
    {} as Request,
    response,
    (() => undefined) as NextFunction,
  );
  assert.equal(status, 401);
});
