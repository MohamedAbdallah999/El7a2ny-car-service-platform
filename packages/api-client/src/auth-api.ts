import type {
  AdminInvitationResponse,
  AuthProfile,
  AuthSuccessResponse,
  LoginResponse,
  RegistrationStartedResponse,
  RegistrationVerifiedResponse,
} from "@car-platform/types";
import type { ApiClient } from "./client.js";

// Payload shapes mirror backend/src/modules/auth/auth.validation.ts.

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AdminRegisterPayload extends RegisterPayload {
  invitationToken: string;
}

export interface VerifyRegistrationPayload {
  registrationId: string;
  code: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyLoginPayload {
  challengeToken: string;
  code: string;
}

export interface CreateAdminInvitationPayload {
  email: string;
  phone: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Thin, typed wrapper over /api/auth/*. Every consuming app (customer-web,
// admin-web, ...) builds one of these from its own createApiClient instance
// rather than hand-rolling fetch calls per screen.
export const createAuthApi = (client: ApiClient) => ({
  register: (payload: RegisterPayload) =>
    client.request<RegistrationStartedResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyRegistration: (payload: VerifyRegistrationPayload) =>
    client.request<RegistrationVerifiedResponse>("/auth/register/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerAdmin: (payload: AdminRegisterPayload) =>
    client.request<RegistrationStartedResponse>("/auth/admin/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyAdminRegistration: (payload: VerifyRegistrationPayload) =>
    client.request<RegistrationVerifiedResponse>(
      "/auth/admin/register/verify",
      { method: "POST", body: JSON.stringify(payload) },
    ),

  login: (payload: LoginPayload) =>
    client.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyLogin: (payload: VerifyLoginPayload) =>
    client.request<AuthSuccessResponse>("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createAdminInvitation: (payload: CreateAdminInvitationPayload) =>
    client.request<AdminInvitationResponse>("/auth/admin/invitations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => client.request<{ user: AuthProfile }>("/auth/me"),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    client.request<ForgotPasswordResponse>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordPayload) =>
    client.request<ResetPasswordResponse>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
});

export type AuthApi = ReturnType<typeof createAuthApi>;
