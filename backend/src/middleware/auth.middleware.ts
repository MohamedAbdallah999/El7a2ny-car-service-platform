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

// Populates `req.user` when a valid token is present, but never rejects the
// request otherwise — for endpoints that are public but behave differently
// for a signed-in caller (e.g. a business admin seeing unpublished reviews
// alongside everyone else's published ones).
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const match = authHeader ? /^Bearer ([^\s]+)$/i.exec(authHeader) : null;

  if (!match?.[1]) {
    next();
    return;
  }

  try {
    const payload = verifyToken(match[1]);
    const user = await authRepository.findAuthenticationUserById(payload.userId);

    if (user && user.status === UserStatus.ACTIVE && user.role === payload.role) {
      req.user = { id: user.id, role: user.role };
    }
  } catch {
    // An invalid/expired token on an optional-auth route is treated as
    // "anonymous", not an error.
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
