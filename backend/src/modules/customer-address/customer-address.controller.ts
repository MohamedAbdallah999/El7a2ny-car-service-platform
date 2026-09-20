import type { Request, Response } from "express";
import { requireParam, requireUserId } from "../../utils/request.js";
import { customerAddressService } from "./customer-address.service.js";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "./customer-address.validation.js";

export const listAddresses = async (req: Request, res: Response) => {
  const addresses = await customerAddressService.list(requireUserId(req));
  res.status(200).json({ addresses });
};

export const createAddress = async (req: Request, res: Response) => {
  const address = await customerAddressService.create(
    requireUserId(req),
    req.body as CreateAddressInput,
  );
  res.status(201).json({ address });
};

export const updateAddress = async (req: Request, res: Response) => {
  const address = await customerAddressService.update(
    requireUserId(req),
    requireParam(req, "addressId"),
    req.body as UpdateAddressInput,
  );
  res.status(200).json({ address });
};

export const deleteAddress = async (req: Request, res: Response) => {
  await customerAddressService.remove(
    requireUserId(req),
    requireParam(req, "addressId"),
  );
  res.status(204).send();
};
