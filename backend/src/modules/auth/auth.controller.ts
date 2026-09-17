import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { authService } from "./auth.service.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body as LoginInput);
  res.status(200).json(result);
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await authService.getProfile(userId);
  res.status(200).json({ user });
};
