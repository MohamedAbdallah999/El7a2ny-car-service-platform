import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { authService } from "./auth.service.js";
import type {
  AdminInvitationInput,
  AdminRegistrationInput,
  LoginInput,
  LoginVerificationInput,
  RegisterInput,
  RegistrationVerificationInput,
} from "./auth.validation.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.startCustomerRegistration(
    req.body as RegisterInput,
  );
  res.status(202).json(result);
};

export const verifyRegistration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await authService.completeRegistration(
    req.body as RegistrationVerificationInput,
  );
  res.status(201).json(result);
};

export const registerAdmin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await authService.startAdminRegistration(
    req.body as AdminRegistrationInput,
  );
  res.status(202).json(result);
};

export const verifyAdminRegistration = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await authService.completeRegistration(
    req.body as RegistrationVerificationInput,
  );
  res.status(201).json(result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body as LoginInput);
  res.status("requiresTwoFactor" in result ? 202 : 200).json(result);
};

export const verifyLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = await authService.completePrivilegedLogin(
    req.body as LoginVerificationInput,
  );
  res.status(200).json(result);
};

export const createAdminInvitation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const result = await authService.createAdminInvitation(
    userId,
    req.body as AdminInvitationInput,
  );
  res.status(201).json(result);
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, "Unauthorized");
  }

  const user = await authService.getProfile(userId);
  res.status(200).json({ user });
};
