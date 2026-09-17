import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { paymentService } from "./payment.service.js";
import type {
  CreatePaymentInput,
  CreateRefundInput,
  FailPaymentInput,
  PaymentListQueryInput,
  RefundStatusUpdateInput,
} from "./payment.validation.js";

const requireRole = (req: Request) => {
  const role = req.user?.role;
  if (!role) {
    throw new AppError(401, "Unauthorized");
  }
  return role;
};

export const createPayment = async (req: Request, res: Response) => {
  const payment = await paymentService.create(
    requireUserId(req),
    req.body as CreatePaymentInput,
  );
  res.status(201).json({ payment });
};

export const listMyPayments = async (req: Request, res: Response) => {
  const result = await paymentService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as PaymentListQueryInput,
  );
  res.status(200).json(result);
};

export const listBusinessPayments = async (req: Request, res: Response) => {
  const result = await paymentService.listForBusiness(
    requireUserId(req),
    req.validatedQuery as unknown as PaymentListQueryInput,
  );
  res.status(200).json(result);
};

export const getPayment = async (req: Request, res: Response) => {
  const payment = await paymentService.getById(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "paymentId"),
  );
  res.status(200).json({ payment });
};

export const confirmPayment = async (req: Request, res: Response) => {
  const payment = await paymentService.confirm(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "paymentId"),
  );
  res.status(200).json({ payment });
};

export const failPayment = async (req: Request, res: Response) => {
  const payment = await paymentService.fail(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "paymentId"),
    req.body as FailPaymentInput,
  );
  res.status(200).json({ payment });
};

export const createRefund = async (req: Request, res: Response) => {
  const refund = await paymentService.createRefund(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "paymentId"),
    req.body as CreateRefundInput,
  );
  res.status(201).json({ refund });
};

export const updateRefundStatus = async (req: Request, res: Response) => {
  const refund = await paymentService.updateRefundStatus(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "refundId"),
    req.body as RefundStatusUpdateInput,
  );
  res.status(200).json({ refund });
};
