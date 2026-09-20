import type { Request, Response } from "express";
import { requireParam, requireUserId } from "../../utils/request.js";
import { serviceModuleService } from "./service.service.js";
import type {
  CreateCategoryInput,
  CreateCompatibilityInput,
  CreateServiceInput,
  ServiceListQueryInput,
  UpdateCategoryInput,
  UpdateServiceInput,
} from "./service.validation.js";

export const listCategories = async (req: Request, res: Response) => {
  const categories = await serviceModuleService.listCategories(
    req.query.includeInactive === "true",
  );
  res.status(200).json({ categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await serviceModuleService.createCategory(
    req.body as CreateCategoryInput,
  );
  res.status(201).json({ category });
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await serviceModuleService.updateCategory(
    requireParam(req, "categoryId"),
    req.body as UpdateCategoryInput,
  );
  res.status(200).json({ category });
};

export const listServices = async (req: Request, res: Response) => {
  const result = await serviceModuleService.listPublic(
    req.validatedQuery as unknown as ServiceListQueryInput,
  );
  res.status(200).json(result);
};

export const getService = async (req: Request, res: Response) => {
  const service = await serviceModuleService.getById(
    requireParam(req, "serviceId"),
  );
  res.status(200).json({ service });
};

export const createService = async (req: Request, res: Response) => {
  const service = await serviceModuleService.create(
    requireUserId(req),
    req.body as CreateServiceInput,
  );
  res.status(201).json({ service });
};

export const updateService = async (req: Request, res: Response) => {
  const service = await serviceModuleService.update(
    requireUserId(req),
    requireParam(req, "serviceId"),
    req.body as UpdateServiceInput,
  );
  res.status(200).json({ service });
};

export const deleteService = async (req: Request, res: Response) => {
  await serviceModuleService.remove(
    requireUserId(req),
    requireParam(req, "serviceId"),
  );
  res.status(204).send();
};

export const addCompatibility = async (req: Request, res: Response) => {
  const compatibility = await serviceModuleService.addCompatibility(
    requireUserId(req),
    requireParam(req, "serviceId"),
    req.body as CreateCompatibilityInput,
  );
  res.status(201).json({ compatibility });
};

export const removeCompatibility = async (req: Request, res: Response) => {
  await serviceModuleService.removeCompatibility(
    requireUserId(req),
    requireParam(req, "compatibilityId"),
  );
  res.status(204).send();
};
