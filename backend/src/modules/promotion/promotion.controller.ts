import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { promotionService } from "./promotion.service.js";
import type {
  AttachTargetInput,
  CreatePromotionInput,
  PromotionListQueryInput,
  UpdatePromotionInput,
} from "./promotion.validation.js";

const requireManagerRole = (req: Request): "ADMIN" | "SUPER_ADMIN" => {
  const role = req.user?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new AppError(403, "Forbidden");
  }
  return role;
};

export const createPromotion = async (req: Request, res: Response) => {
  const promotion = await promotionService.create(
    requireUserId(req),
    requireManagerRole(req),
    req.body as CreatePromotionInput,
  );
  res.status(201).json({ promotion });
};

export const updatePromotion = async (req: Request, res: Response) => {
  const promotion = await promotionService.update(
    requireUserId(req),
    requireManagerRole(req),
    requireParam(req, "promotionId"),
    req.body as UpdatePromotionInput,
  );
  res.status(200).json({ promotion });
};

export const deactivatePromotion = async (req: Request, res: Response) => {
  await promotionService.deactivate(
    requireUserId(req),
    requireManagerRole(req),
    requireParam(req, "promotionId"),
  );
  res.status(204).send();
};

export const listPromotions = async (req: Request, res: Response) => {
  const result = await promotionService.list(
    req.validatedQuery as unknown as PromotionListQueryInput,
  );
  res.status(200).json(result);
};

export const validatePromotionCode = async (req: Request, res: Response) => {
  const amount = Number(req.query.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    res.status(400).json({ error: "A valid amount query parameter is required" });
    return;
  }
  const result = await promotionService.validateCode(
    requireParam(req, "code"),
    amount,
  );
  res.status(200).json(result);
};

export const attachPromotionTarget = async (req: Request, res: Response) => {
  const link = await promotionService.attachProduct(
    requireUserId(req),
    requireManagerRole(req),
    requireParam(req, "promotionId"),
    req.body as AttachTargetInput,
  );
  res.status(201).json({ link });
};
