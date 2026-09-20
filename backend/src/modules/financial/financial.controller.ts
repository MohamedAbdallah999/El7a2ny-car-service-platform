import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { financialService } from "./financial.service.js";
import type {
  BusinessScopedQueryInput,
  CreateCommissionRuleInput,
  CreatePayoutInput,
  PayoutStatusUpdateInput,
} from "./financial.validation.js";

export const createCommissionRule = async (req: Request, res: Response) => {
  const rule = await financialService.createCommissionRule(
    req.body as CreateCommissionRuleInput,
  );
  res.status(201).json({ rule });
};

export const listCommissionRules = async (req: Request, res: Response) => {
  const businessId =
    typeof req.query.businessId === "string" ? req.query.businessId : undefined;
  const rules = await financialService.listCommissionRules(businessId);
  res.status(200).json({ rules });
};

export const listTransactions = async (req: Request, res: Response) => {
  const query = req.validatedQuery as unknown as BusinessScopedQueryInput;
  const result =
    req.user?.role === "SUPER_ADMIN"
      ? await financialService.listTransactionsForSuperAdmin(query)
      : await financialService.listTransactionsForAdmin(requireUserId(req), query);
  res.status(200).json(result);
};

export const createPayout = async (req: Request, res: Response) => {
  const payout = await financialService.createPayout(req.body as CreatePayoutInput);
  res.status(201).json({ payout });
};

export const listPayouts = async (req: Request, res: Response) => {
  const query = req.validatedQuery as unknown as BusinessScopedQueryInput;
  if (req.user?.role === "SUPER_ADMIN") {
    const result = await financialService.listPayoutsForSuperAdmin(query);
    res.status(200).json(result);
    return;
  }
  if (!query.businessId) {
    throw new AppError(400, "businessId query parameter is required");
  }
  const result = await financialService.listPayoutsForAdmin(
    requireUserId(req),
    query.businessId,
    query,
  );
  res.status(200).json(result);
};

export const updatePayoutStatus = async (req: Request, res: Response) => {
  const payout = await financialService.updatePayoutStatus(
    requireParam(req, "payoutId"),
    req.body as PayoutStatusUpdateInput,
  );
  res.status(200).json({ payout });
};
