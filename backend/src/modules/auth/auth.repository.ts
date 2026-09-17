import {
  AuthChallengeType,
  UserRole,
  VerificationTokenType,
} from "../../generated/prisma/client.js";
import { prisma } from "../../config/database.js";

const registrationExpiry = (): Date => new Date(Date.now() + 10 * 60 * 1000);
const loginChallengeExpiry = (): Date => new Date(Date.now() + 10 * 60 * 1000);
const invitationExpiry = (): Date =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export const authRepository = {
  findUserByEmailOrPhone(email: string, phone: string) {
    return prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findPendingRegistrationByContact(email: string, phone: string) {
    return prisma.pendingRegistration.findFirst({
      where: {
        OR: [{ email }, { phone }],
        expiresAt: { gt: new Date() },
      },
    });
  },

  async createPendingRegistration(input: {
    email: string;
    phone: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    adminInvitationId?: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      await transaction.pendingRegistration.deleteMany({
        where: { OR: [{ email: input.email }, { phone: input.phone }] },
      });

      return transaction.pendingRegistration.create({
        data: { ...input, expiresAt: registrationExpiry() },
      });
    });
  },

  findPendingRegistration(registrationId: string) {
    return prisma.pendingRegistration.findFirst({
      where: { id: registrationId, expiresAt: { gt: new Date() } },
    });
  },

  deletePendingRegistration(registrationId: string) {
    return prisma.pendingRegistration.deleteMany({
      where: { id: registrationId },
    });
  },

  async completePendingRegistration(registrationId: string) {
    return prisma.$transaction(async (transaction) => {
      const pending = await transaction.pendingRegistration.findFirst({
        where: { id: registrationId, expiresAt: { gt: new Date() } },
      });

      if (!pending) {
        return null;
      }

      const user = await transaction.user.create({
        data: {
          email: pending.email,
          phone: pending.phone,
          passwordHash: pending.passwordHash,
          firstName: pending.firstName,
          lastName: pending.lastName,
          role: pending.role,
          phoneVerified: true,
        },
      });

      if (pending.role === UserRole.CUSTOMER) {
        await transaction.customer.create({ data: { userId: user.id } });
      }

      if (pending.role === UserRole.ADMIN) {
        if (!pending.adminInvitationId) {
          throw new Error("Admin registration is missing an invitation");
        }

        await transaction.admin.create({ data: { userId: user.id } });
        const invitation = await transaction.adminInvitation.updateMany({
          where: { id: pending.adminInvitationId, usedAt: null },
          data: { usedAt: new Date() },
        });

        if (invitation.count !== 1) {
          throw new Error("Admin invitation is no longer available");
        }
      }

      await transaction.pendingRegistration.delete({
        where: { id: pending.id },
      });
      return user;
    });
  },

  async createAdminInvitation(input: {
    email: string;
    phone: string;
    tokenHash: string;
    createdByUserId: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      await transaction.adminInvitation.deleteMany({
        where: { OR: [{ email: input.email }, { phone: input.phone }] },
      });

      return transaction.adminInvitation.create({
        data: { ...input, expiresAt: invitationExpiry() },
      });
    });
  },

  findAdminInvitation(email: string, phone: string, tokenHash: string) {
    return prisma.adminInvitation.findFirst({
      where: {
        email,
        phone,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  },

  findActiveAdminInvitationByContact(email: string, phone: string) {
    return prisma.adminInvitation.findFirst({
      where: {
        OR: [{ email }, { phone }],
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  },

  async createLoginChallenge(userId: string, tokenHash: string) {
    return prisma.$transaction(async (transaction) => {
      await transaction.loginChallenge.deleteMany({
        where: { userId, type: AuthChallengeType.PRIVILEGED_LOGIN },
      });

      return transaction.loginChallenge.create({
        data: {
          userId,
          tokenHash,
          type: AuthChallengeType.PRIVILEGED_LOGIN,
          expiresAt: loginChallengeExpiry(),
        },
      });
    });
  },

  findActiveLoginChallenge(tokenHash: string) {
    return prisma.loginChallenge.findFirst({
      where: {
        tokenHash,
        type: AuthChallengeType.PRIVILEGED_LOGIN,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  consumeLoginChallenge(challengeId: string) {
    return prisma.loginChallenge.updateMany({
      where: { id: challengeId, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
  },

  updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  },

  findAuthenticationUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });
  },

  findProfileById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  },

  async createPasswordResetToken(userId: string, tokenHash: string) {
    return prisma.$transaction(async (transaction) => {
      await transaction.userVerificationToken.deleteMany({
        where: { userId, type: VerificationTokenType.PASSWORD_RESET },
      });

      return transaction.userVerificationToken.create({
        data: {
          userId,
          tokenHash,
          type: VerificationTokenType.PASSWORD_RESET,
          expiresAt: registrationExpiry(),
        },
      });
    });
  },

  deletePasswordResetToken(tokenId: string) {
    return prisma.userVerificationToken.deleteMany({ where: { id: tokenId } });
  },

  findActivePasswordResetToken(tokenHash: string) {
    return prisma.userVerificationToken.findFirst({
      where: {
        tokenHash,
        type: VerificationTokenType.PASSWORD_RESET,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  async resetPassword(tokenId: string, userId: string, passwordHash: string) {
    return prisma.$transaction(async (transaction) => {
      const consumed = await transaction.userVerificationToken.updateMany({
        where: { id: tokenId, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });

      if (consumed.count !== 1) {
        throw new Error("Password reset request is no longer available");
      }

      return transaction.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
    });
  },
};
