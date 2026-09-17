import type { Request, Response } from "express";
import { requireParam, requireUserId } from "../../utils/request.js";
import { cartService } from "./cart.service.js";
import type { AddCartItemInput, UpdateCartItemInput } from "./cart.validation.js";

export const getCart = async (req: Request, res: Response) => {
  const result = await cartService.getMine(requireUserId(req));
  res.status(200).json(result);
};

export const addCartItem = async (req: Request, res: Response) => {
  const result = await cartService.addItem(
    requireUserId(req),
    req.body as AddCartItemInput,
  );
  res.status(200).json(result);
};

export const updateCartItem = async (req: Request, res: Response) => {
  const result = await cartService.updateItem(
    requireUserId(req),
    requireParam(req, "itemId"),
    req.body as UpdateCartItemInput,
  );
  res.status(200).json(result);
};

export const removeCartItem = async (req: Request, res: Response) => {
  const result = await cartService.removeItem(
    requireUserId(req),
    requireParam(req, "itemId"),
  );
  res.status(200).json(result);
};

export const clearCart = async (req: Request, res: Response) => {
  const result = await cartService.clear(requireUserId(req));
  res.status(200).json(result);
};
