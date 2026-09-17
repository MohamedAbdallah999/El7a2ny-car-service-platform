import { AppError } from "../../errors/app-error.js";
import { Prisma, UserStatus } from "../../generated/prisma/client.js";
import { comparePassword, hashPassword } from "./auth.password.js";
import { authRepository } from "./auth.repository.js";
import { signToken } from "./auth.token.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

const DUMMY_PASSWORD_HASH =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxZN7sM1QW1HpnRnWaZm3LjQwK6";

const publicUser = <
  T extends {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
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

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await authRepository.findByEmailOrPhone(
      input.email,
      input.phone,
    );

    if (existingUser) {
      throw new AppError(409, "User with this email or phone already exists");
    }

    const passwordHash = await hashPassword(input.password);

    try {
      const user = await authRepository.createCustomer({
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
      });

      return {
        message: "User registered successfully",
        token: signToken({ userId: user.id, role: user.role }),
        user: publicUser(user),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(409, "User with this email or phone already exists");
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

    await authRepository.updateLastLogin(user.id);

    return {
      message: "Login successful",
      token: signToken({ userId: user.id, role: user.role }),
      user: publicUser(user),
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
