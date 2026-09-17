import { prisma } from "../../config/database.js";
import { UserRole } from "../../generated/prisma/client.js";

export const authRepository = {
  findByEmailOrPhone(email: string, phone?: string) {
    return prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  createCustomer(input: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          ...input,
          role: UserRole.CUSTOMER,
        },
      });

      await transaction.customer.create({ data: { userId: user.id } });
      return user;
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
};
