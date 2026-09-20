import type { Request } from "express";
import { AppError } from "../errors/app-error.js";

// Route params are always a single string for a named `:segment` (arrays
// only occur for wildcard/repeated-splat routes, which this codebase
// doesn't use), but @types/express types every param as `string | string[]`
// to account for that. This narrows it back down for the common case.
export const requireUserId = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }
  return userId;
};

export const requireParam = (req: Request, name: string): string => {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(400, `Missing "${name}" parameter`);
  }
  return value;
};
