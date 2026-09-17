import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../modules/auth/auth.token.js";
import { UserRole, UserStatus } from "../generated/prisma/client.js";
import { authRepository } from "../modules/auth/auth.repository.js";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const match = /^Bearer ([^\s]+)$/i.exec(authHeader);
  if (!match?.[1]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let payload;
  try {
    payload = verifyToken(match[1]);
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await authRepository.findAuthenticationUserById(
      payload.userId,
    );

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      user.role !== payload.role
    ) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
    };
  } catch (error) {
    next(error);
    return;
  }

  next();
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    next();
  };
};
