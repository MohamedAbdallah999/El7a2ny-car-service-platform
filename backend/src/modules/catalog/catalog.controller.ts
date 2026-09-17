import type { Request, Response } from "express";
import { requireParam, requireUserId } from "../../utils/request.js";
import { catalogService } from "./catalog.service.js";
import type {
  AddCompatibilityInput,
  AddProductImageInput,
  AdjustInventoryInput,
  CreateInventoryInput,
  CreateProductCategoryInput,
  CreateProductInput,
  ProductListQueryInput,
  UpdateProductCategoryInput,
  UpdateProductInput,
} from "./catalog.validation.js";

export const listCategories = async (req: Request, res: Response) => {
  const categories = await catalogService.listCategories(
    req.query.includeInactive === "true",
  );
  res.status(200).json({ categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await catalogService.createCategory(
    req.body as CreateProductCategoryInput,
  );
  res.status(201).json({ category });
};

export const updateCategory = async (req: Request, res: Response) => {
  const category = await catalogService.updateCategory(
    requireParam(req, "categoryId"),
    req.body as UpdateProductCategoryInput,
  );
  res.status(200).json({ category });
};

export const listProducts = async (req: Request, res: Response) => {
  const result = await catalogService.listPublic(
    req.validatedQuery as unknown as ProductListQueryInput,
  );
  res.status(200).json(result);
};

export const getProductBySlug = async (req: Request, res: Response) => {
  const product = await catalogService.getBySlug(requireParam(req, "slug"));
  res.status(200).json({ product });
};

export const getProduct = async (req: Request, res: Response) => {
  const product = await catalogService.getById(requireParam(req, "productId"));
  res.status(200).json({ product });
};

export const createProduct = async (req: Request, res: Response) => {
  const product = await catalogService.create(
    requireUserId(req),
    req.body as CreateProductInput,
  );
  res.status(201).json({ product });
};

export const updateProduct = async (req: Request, res: Response) => {
  const product = await catalogService.update(
    requireUserId(req),
    requireParam(req, "productId"),
    req.body as UpdateProductInput,
  );
  res.status(200).json({ product });
};

export const deleteProduct = async (req: Request, res: Response) => {
  await catalogService.remove(requireUserId(req), requireParam(req, "productId"));
  res.status(204).send();
};

export const addProductImage = async (req: Request, res: Response) => {
  const image = await catalogService.addImage(
    requireUserId(req),
    requireParam(req, "productId"),
    req.body as AddProductImageInput,
  );
  res.status(201).json({ image });
};

export const removeProductImage = async (req: Request, res: Response) => {
  await catalogService.removeImage(requireUserId(req), requireParam(req, "imageId"));
  res.status(204).send();
};

export const addCompatibility = async (req: Request, res: Response) => {
  const compatibility = await catalogService.addCompatibility(
    requireUserId(req),
    requireParam(req, "productId"),
    req.body as AddCompatibilityInput,
  );
  res.status(201).json({ compatibility });
};

export const removeCompatibility = async (req: Request, res: Response) => {
  await catalogService.removeCompatibility(
    requireUserId(req),
    requireParam(req, "compatibilityId"),
  );
  res.status(204).send();
};

export const createInventory = async (req: Request, res: Response) => {
  const inventory = await catalogService.createInventory(
    requireUserId(req),
    req.body as CreateInventoryInput,
  );
  res.status(201).json({ inventory });
};

export const listInventory = async (req: Request, res: Response) => {
  const businessId = req.query.businessId;
  if (typeof businessId !== "string") {
    res.status(400).json({ error: "businessId query parameter is required" });
    return;
  }
  const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
  const page = Number(req.query.page) || undefined;
  const limit = Number(req.query.limit) || undefined;
  const result = await catalogService.listInventory(
    requireUserId(req),
    businessId,
    branchId,
    page ?? 1,
    limit ?? 20,
  );
  res.status(200).json(result);
};

export const adjustInventory = async (req: Request, res: Response) => {
  const inventory = await catalogService.adjustInventory(
    requireUserId(req),
    requireParam(req, "inventoryId"),
    req.body as AdjustInventoryInput,
  );
  res.status(200).json({ inventory });
};

export const listMovements = async (req: Request, res: Response) => {
  const movements = await catalogService.listMovements(
    requireUserId(req),
    requireParam(req, "inventoryId"),
  );
  res.status(200).json({ movements });
};
