import type { UserRole, UserStatus } from "@car-platform/constants";

// Wire types for backend/src/modules/auth. Keep these in sync with
// auth.service.ts and auth.repository.ts by hand: the backend has no
// dependency on this package (it derives its own types from Prisma), so
// this is the frontend/API-client's contract with that module, not a type
// shared by import.

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
}

// The `user` embedded in a successful login/registration response
// (auth.service.ts `publicUser`) — intentionally narrower than AuthProfile.
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// GET /api/auth/me (auth.repository.ts `findProfileById`).
export interface AuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export interface AuthSuccessResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// POST /api/auth/register, POST /api/auth/admin/register
export interface RegistrationStartedResponse {
  message: string;
  registrationId: string;
}

// POST /api/auth/register/verify when the pending registration was for an
// admin — no token is issued, since admins must still complete privileged
// login (password + OTP) separately.
export interface AdminRegisteredResponse {
  message: string;
}

// POST /api/auth/register/verify, POST /api/auth/admin/register/verify
export type RegistrationVerifiedResponse =
  AuthSuccessResponse | AdminRegisteredResponse;

// POST /api/auth/login when the account requires two-factor verification
// (admin / super admin).
export interface LoginChallengeResponse {
  message: string;
  requiresTwoFactor: true;
  challengeToken: string;
}

// POST /api/auth/login
export type LoginResponse = AuthSuccessResponse | LoginChallengeResponse;

// POST /api/auth/admin/invitations
export interface AdminInvitationResponse {
  message: string;
  invitationToken: string;
  expiresAt: string;
}

export const isLoginChallengeResponse = (
  response: LoginResponse,
): response is LoginChallengeResponse => "requiresTwoFactor" in response;
