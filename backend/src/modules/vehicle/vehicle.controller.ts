import type { Request, Response } from "express";
import { requireParam, requireUserId } from "../../utils/request.js";
import { vehicleService } from "./vehicle.service.js";
import type {
  CreateMakeInput,
  CreateModelInput,
  CreateVehicleInput,
  UpdateMakeInput,
  UpdateModelInput,
  UpdateVehicleInput,
} from "./vehicle.validation.js";

export const listMakes = async (req: Request, res: Response) => {
  const makes = await vehicleService.listMakes(req.query.includeInactive === "true");
  res.status(200).json({ makes });
};

export const createMake = async (req: Request, res: Response) => {
  const make = await vehicleService.createMake(req.body as CreateMakeInput);
  res.status(201).json({ make });
};

export const updateMake = async (req: Request, res: Response) => {
  const make = await vehicleService.updateMake(
    requireParam(req, "makeId"),
    req.body as UpdateMakeInput,
  );
  res.status(200).json({ make });
};

export const listModels = async (req: Request, res: Response) => {
  const models = await vehicleService.listModels(
    requireParam(req, "makeId"),
    req.query.includeInactive === "true",
  );
  res.status(200).json({ models });
};

export const createModel = async (req: Request, res: Response) => {
  const model = await vehicleService.createModel(
    requireParam(req, "makeId"),
    req.body as CreateModelInput,
  );
  res.status(201).json({ model });
};

export const updateModel = async (req: Request, res: Response) => {
  const model = await vehicleService.updateModel(
    requireParam(req, "modelId"),
    req.body as UpdateModelInput,
  );
  res.status(200).json({ model });
};

export const listMyVehicles = async (req: Request, res: Response) => {
  const vehicles = await vehicleService.listMine(requireUserId(req));
  res.status(200).json({ vehicles });
};

export const getVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.getOwned(
    requireUserId(req),
    requireParam(req, "vehicleId"),
  );
  res.status(200).json({ vehicle });
};

export const createVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.create(
    requireUserId(req),
    req.body as CreateVehicleInput,
  );
  res.status(201).json({ vehicle });
};

export const updateVehicle = async (req: Request, res: Response) => {
  const vehicle = await vehicleService.update(
    requireUserId(req),
    requireParam(req, "vehicleId"),
    req.body as UpdateVehicleInput,
  );
  res.status(200).json({ vehicle });
};

export const deleteVehicle = async (req: Request, res: Response) => {
  await vehicleService.remove(requireUserId(req), requireParam(req, "vehicleId"));
  res.status(204).send();
};
