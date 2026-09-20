import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { orderService } from "./order.service.js";
import type {
  CheckoutInput,
  CreateShipmentInput,
  OrderListQueryInput,
  OrderStatusUpdateInput,
  ShipmentStatusUpdateInput,
} from "./order.validation.js";

const requireRole = (req: Request) => {
  const role = req.user?.role;
  if (!role) {
    throw new AppError(401, "Unauthorized");
  }
  return role;
};

export const checkout = async (req: Request, res: Response) => {
  const order = await orderService.checkout(
    requireUserId(req),
    req.body as CheckoutInput,
  );
  res.status(201).json({ order });
};

export const listMyOrders = async (req: Request, res: Response) => {
  const result = await orderService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as OrderListQueryInput,
  );
  res.status(200).json(result);
};

export const listBusinessOrders = async (req: Request, res: Response) => {
  const result = await orderService.listForBusiness(
    requireUserId(req),
    req.validatedQuery as unknown as OrderListQueryInput,
  );
  res.status(200).json(result);
};

export const getOrder = async (req: Request, res: Response) => {
  const order = await orderService.getById(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "orderId"),
  );
  res.status(200).json({ order });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const order = await orderService.updateStatus(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "orderId"),
    req.body as OrderStatusUpdateInput,
  );
  res.status(200).json({ order });
};

export const createShipment = async (req: Request, res: Response) => {
  const shipment = await orderService.createShipment(
    requireUserId(req),
    requireParam(req, "orderId"),
    req.body as CreateShipmentInput,
  );
  res.status(201).json({ shipment });
};

export const updateShipmentStatus = async (req: Request, res: Response) => {
  const shipment = await orderService.updateShipmentStatus(
    requireUserId(req),
    requireParam(req, "shipmentId"),
    req.body as ShipmentStatusUpdateInput,
  );
  res.status(200).json({ shipment });
};
