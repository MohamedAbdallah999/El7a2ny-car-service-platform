import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { UserRole, UserStatus } from "../generated/prisma/client.js";
import { Prisma } from "../generated/prisma/client.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

const DUMMY_PASSWORD_HASH =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxZN7sM1QW1HpnRnWaZm3LjQwK6";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid registration data",
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }
    const { email, password, firstName, lastName, phone } = parsed.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, ...(phone ? [{ phone }] : [])],
      },
    });

    if (existingUser) {
      res
        .status(409)
        .json({ error: "User with this email or phone already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          phone,
          role: UserRole.CUSTOMER,
        },
      });

      await transaction.customer.create({
        data: { userId: createdUser.id },
      });

      return createdUser;
    });

    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res
        .status(409)
        .json({ error: "User with this email or phone already exists" });
      return;
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password" });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await comparePassword(password, DUMMY_PASSWORD_HASH);
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (user.status !== UserStatus.ACTIVE) {
    await comparePassword(password, user.passwordHash);
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = signToken({ userId: user.id, role: user.role });

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await prisma.user.findUnique({
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

  if (!user || user.status !== UserStatus.ACTIVE) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.status(200).json({ user });
};
