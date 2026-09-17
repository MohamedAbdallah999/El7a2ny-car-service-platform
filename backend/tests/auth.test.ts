import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { UserRole } from "../src/generated/prisma/client.js";
import { authorize } from "../src/middleware/auth.middleware.js";
import {
  loginSchema,
  passwordSchema,
  registerSchema,
} from "../src/modules/auth/auth.validation.js";
import { signToken, verifyToken } from "../src/modules/auth/auth.token.js";
import {
  comparePassword,
  hashPassword,
} from "../src/modules/auth/auth.password.js";

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

test("authentication schemas normalize email and reject unknown or oversized input", () => {
  const registration = registerSchema.parse({
    email: "  USER@Example.COM ",
    password: "Correct-Horse-42!",
    firstName: " Test ",
    lastName: " User ",
  });

  assert.equal(registration.email, "user@example.com");
  assert.equal(registration.firstName, "Test");
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
