import { AppError } from "../../errors/app-error.js";
import { Prisma, UserRole, UserStatus } from "../../generated/prisma/client.js";
import { comparePassword, hashPassword } from "./auth.password.js";
import { phoneVerification } from "./auth.phone-verification.js";
import { authRepository } from "./auth.repository.js";
import { createOpaqueToken, hashOpaqueToken } from "./auth.secrets.js";
import { signToken } from "./auth.token.js";
import type {
  AdminInvitationInput,
  AdminRegistrationInput,
  LoginInput,
  LoginVerificationInput,
  RegisterInput,
  RegistrationVerificationInput,
} from "./auth.validation.js";

const DUMMY_PASSWORD_HASH =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxZN7sM1QW1HpnRnWaZm3LjQwK6";

const publicUser = <
  T extends {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  },
>(
  user: T,
) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
});

const authenticationResponse = <T extends Parameters<typeof publicUser>[0]>(
  user: T,
  message = "Login successful",
) => ({
  message,
  token: signToken({ userId: user.id, role: user.role }),
  user: publicUser(user),
});

const duplicateUserError = () =>
  new AppError(409, "User with this email or phone already exists");

const isUniqueConstraintError = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

export const authService = {
  async startCustomerRegistration(input: RegisterInput) {
    return this.startRegistration(input, UserRole.CUSTOMER);
  },

  async startAdminRegistration(input: AdminRegistrationInput) {
    const invitation = await authRepository.findAdminInvitation(
      input.email,
      input.phone,
      hashOpaqueToken(input.invitationToken),
    );

    if (!invitation) {
      throw new AppError(403, "Invalid or expired admin invitation");
    }

    return this.startRegistration(input, UserRole.ADMIN, invitation.id);
  },

  async startRegistration(
    input: RegisterInput,
    role: UserRole,
    adminInvitationId?: string,
  ) {
    const existingUser = await authRepository.findUserByEmailOrPhone(
      input.email,
      input.phone,
    );

    if (existingUser) {
      throw duplicateUserError();
    }

    if (role === UserRole.CUSTOMER) {
      const reservedContact =
        await authRepository.findActiveAdminInvitationByContact(
          input.email,
          input.phone,
        );
      if (reservedContact) {
        throw new AppError(409, "This email or phone cannot be registered");
      }
    }

    const passwordHash = await hashPassword(input.password);
    let pendingRegistration;

    try {
      pendingRegistration = await authRepository.createPendingRegistration({
        email: input.email,
        phone: input.phone,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role,
        adminInvitationId,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw duplicateUserError();
      }
      throw error;
    }

    try {
      await phoneVerification.sendCode(input.phone);
    } catch (error) {
      await authRepository.deletePendingRegistration(pendingRegistration.id);
      throw error;
    }

    return {
      message: "Verification code sent",
      registrationId: pendingRegistration.id,
    };
  },

  async completeRegistration(input: RegistrationVerificationInput) {
    const pendingRegistration = await authRepository.findPendingRegistration(
      input.registrationId,
    );

    if (!pendingRegistration) {
      throw new AppError(400, "Registration verification has expired");
    }

    const approved = await phoneVerification.checkCode(
      pendingRegistration.phone,
      input.code,
    );

    if (!approved) {
      throw new AppError(400, "Invalid verification code");
    }

    try {
      const user = await authRepository.completePendingRegistration(
        pendingRegistration.id,
      );

      if (!user) {
        throw new AppError(400, "Registration verification has expired");
      }

      if (user.role === UserRole.ADMIN) {
        return { message: "Admin registered successfully" };
      }

      return authenticationResponse(user, "User registered successfully");
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw duplicateUserError();
      }
      throw error;
    }
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      await comparePassword(input.password, DUMMY_PASSWORD_HASH);
      throw new AppError(401, "Invalid credentials");
    }

    if (user.status !== UserStatus.ACTIVE) {
      await comparePassword(input.password, user.passwordHash);
      throw new AppError(401, "Invalid credentials");
    }

    if (!(await comparePassword(input.password, user.passwordHash))) {
      throw new AppError(401, "Invalid credentials");
    }

    if (user.role === UserRole.CUSTOMER) {
      if (!user.phoneVerified) {
        throw new AppError(401, "Invalid credentials");
      }

      await authRepository.updateLastLogin(user.id);
      return authenticationResponse(user);
    }

    if (!user.phone || !user.phoneVerified) {
      throw new AppError(
        403,
        "Two-factor authentication is unavailable for this account",
      );
    }

    const challengeToken = createOpaqueToken();
    await authRepository.createLoginChallenge(
      user.id,
      hashOpaqueToken(challengeToken),
    );

    try {
      await phoneVerification.sendCode(user.phone);
    } catch (error) {
      const challenge = await authRepository.findActiveLoginChallenge(
        hashOpaqueToken(challengeToken),
      );
      if (challenge) {
        await authRepository.consumeLoginChallenge(challenge.id);
      }
      throw error;
    }

    return {
      message: "Verification code sent",
      requiresTwoFactor: true,
      challengeToken,
    };
  },

  async completePrivilegedLogin(input: LoginVerificationInput) {
    const challenge = await authRepository.findActiveLoginChallenge(
      hashOpaqueToken(input.challengeToken),
    );

    if (
      !challenge ||
      challenge.user.status !== UserStatus.ACTIVE ||
      !challenge.user.phone ||
      !challenge.user.phoneVerified ||
      (challenge.user.role !== UserRole.ADMIN &&
        challenge.user.role !== UserRole.SUPER_ADMIN)
    ) {
      throw new AppError(401, "Invalid or expired verification request");
    }

    const approved = await phoneVerification.checkCode(
      challenge.user.phone,
      input.code,
    );

    if (!approved) {
      throw new AppError(401, "Invalid verification code");
    }

    const consumed = await authRepository.consumeLoginChallenge(challenge.id);
    if (consumed.count !== 1) {
      throw new AppError(401, "Invalid or expired verification request");
    }

    await authRepository.updateLastLogin(challenge.user.id);
    return authenticationResponse(challenge.user);
  },

  async createAdminInvitation(
    createdByUserId: string,
    input: AdminInvitationInput,
  ) {
    const existingUser = await authRepository.findUserByEmailOrPhone(
      input.email,
      input.phone,
    );
    if (existingUser) {
      throw duplicateUserError();
    }

    const pendingRegistration =
      await authRepository.findPendingRegistrationByContact(
        input.email,
        input.phone,
      );
    if (pendingRegistration) {
      throw new AppError(409, "This email or phone is pending registration");
    }

    const invitationToken = createOpaqueToken();
    const invitation = await authRepository.createAdminInvitation({
      ...input,
      tokenHash: hashOpaqueToken(invitationToken),
      createdByUserId,
    });

    return {
      message: "Admin invitation created",
      invitationToken,
      expiresAt: invitation.expiresAt,
    };
  },

  async getProfile(userId: string) {
    const user = await authRepository.findProfileById(userId);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new AppError(401, "Unauthorized");
    }

    return user;
  },
};
