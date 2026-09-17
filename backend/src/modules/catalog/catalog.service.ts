import {
  buildPaginationMeta,
  generateUniqueSlug,
  normalizePagination,
} from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { catalogRepository } from "./catalog.repository.js";
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

const requireAdminId = async (userId: string): Promise<string> => {
  const adminId = await catalogRepository.findAdminIdByUserId(userId);
  if (!adminId) {
    throw new AppError(403, "Only admin accounts can manage the catalog");
  }
  return adminId;
};

const loadOwnedProduct = async (productId: string, userId: string) => {
  const product = await catalogRepository.findById(productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  if (product.business.admin.userId !== userId) {
    throw new AppError(403, "You do not manage this product");
  }
  return product;
};

export const catalogService = {
  listCategories(includeInactive: boolean) {
    return catalogRepository.listCategories(!includeInactive);
  },

  async createCategory(input: CreateProductCategoryInput) {
    if (input.parentId) {
      const parent = await catalogRepository.findCategoryById(input.parentId);
      if (!parent) {
        throw new AppError(400, "Unknown parent category");
      }
    }
    const { parentId, ...rest } = input;
    const slug = await generateUniqueSlug(input.name, (candidate) =>
      catalogRepository.categorySlugExists(candidate),
    );
    return catalogRepository.createCategory({
      ...rest,
      slug,
      ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
    });
  },

  async updateCategory(categoryId: string, input: UpdateProductCategoryInput) {
    const category = await catalogRepository.findCategoryById(categoryId);
    if (!category) {
      throw new AppError(404, "Product category not found");
    }
    if (input.parentId) {
      const parent = await catalogRepository.findCategoryById(input.parentId);
      if (!parent) {
        throw new AppError(400, "Unknown parent category");
      }
    }
    const { parentId, ...rest } = input;
    return catalogRepository.updateCategory(categoryId, {
      ...rest,
      ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
    });
  },

  async listPublic(query: ProductListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await catalogRepository.listPublic(
      {
        businessId: query.businessId,
        categoryId: query.categoryId,
        brand: query.brand,
        search: query.search,
      },
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getBySlug(slug: string) {
    const product = await catalogRepository.findBySlug(slug);
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    return product;
  },

  async getById(productId: string) {
    const product = await catalogRepository.findById(productId);
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    return product;
  },

  async create(userId: string, input: CreateProductInput) {
    const adminId = await requireAdminId(userId);
    const business = await catalogRepository.findBusinessOwnedBy(
      input.businessId,
      adminId,
    );
    if (!business) {
      throw new AppError(403, "You do not manage this business");
    }
    const category = await catalogRepository.findCategoryById(
      input.categoryId,
    );
    if (!category) {
      throw new AppError(400, "Unknown product category");
    }
    if (await catalogRepository.skuExists(input.sku)) {
      throw new AppError(409, "A product with this SKU already exists");
    }
    const slug = await generateUniqueSlug(input.name, (candidate) =>
      catalogRepository.slugExists(candidate),
    );
    return catalogRepository.create({ ...input, slug });
  },

  async update(userId: string, productId: string, input: UpdateProductInput) {
    const product = await loadOwnedProduct(productId, userId);
    if (input.categoryId) {
      const category = await catalogRepository.findCategoryById(
        input.categoryId,
      );
      if (!category) {
        throw new AppError(400, "Unknown product category");
      }
    }
    if (input.sku && input.sku !== product.sku && (await catalogRepository.skuExists(input.sku))) {
      throw new AppError(409, "A product with this SKU already exists");
    }
    return catalogRepository.update(productId, input);
  },

  async remove(userId: string, productId: string) {
    await loadOwnedProduct(productId, userId);
    await catalogRepository.softDelete(productId);
  },

  async addImage(userId: string, productId: string, input: AddProductImageInput) {
    await loadOwnedProduct(productId, userId);
    return catalogRepository.addImage(productId, input);
  },

  async removeImage(userId: string, imageId: string) {
    const image = await catalogRepository.findImageById(imageId);
    if (!image) {
      throw new AppError(404, "Image not found");
    }
    if (image.product.business.admin.userId !== userId) {
      throw new AppError(403, "You do not manage this product");
    }
    await catalogRepository.removeImage(imageId);
  },

  async addCompatibility(
    userId: string,
    productId: string,
    input: AddCompatibilityInput,
  ) {
    await loadOwnedProduct(productId, userId);
    return catalogRepository.addCompatibility(productId, input);
  },

  async removeCompatibility(userId: string, compatibilityId: string) {
    const compatibility =
      await catalogRepository.findCompatibilityById(compatibilityId);
    if (!compatibility) {
      throw new AppError(404, "Compatibility rule not found");
    }
    if (compatibility.product.business.admin.userId !== userId) {
      throw new AppError(403, "You do not manage this product");
    }
    await catalogRepository.removeCompatibility(compatibilityId);
  },

  async createInventory(userId: string, input: CreateInventoryInput) {
    const adminId = await requireAdminId(userId);
    const business = await catalogRepository.findBusinessOwnedBy(
      input.businessId,
      adminId,
    );
    if (!business) {
      throw new AppError(403, "You do not manage this business");
    }
    const branch = await catalogRepository.findBranchInBusiness(
      input.branchId,
      input.businessId,
    );
    if (!branch) {
      throw new AppError(400, "Branch does not belong to this business");
    }
    const product = await catalogRepository.findById(input.productId);
    if (!product || product.businessId !== input.businessId) {
      throw new AppError(400, "Product does not belong to this business");
    }
    if (await catalogRepository.inventoryExists(input.branchId, input.productId)) {
      throw new AppError(409, "Inventory already exists for this product at this branch");
    }
    return catalogRepository.createInventory({
      ...input,
      availableQuantity: input.quantity,
    });
  },

  async listInventory(userId: string, businessId: string, branchId: string | undefined, page: number, limit: number) {
    const adminId = await requireAdminId(userId);
    const business = await catalogRepository.findBusinessOwnedBy(
      businessId,
      adminId,
    );
    if (!business) {
      throw new AppError(403, "You do not manage this business");
    }
    const { skip, take } = normalizePagination({ page, limit });
    const [items, total] = await catalogRepository.listInventory(
      businessId,
      branchId,
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async adjustInventory(
    userId: string,
    inventoryId: string,
    input: AdjustInventoryInput,
  ) {
    const inventory = await catalogRepository.findInventoryById(inventoryId);
    if (!inventory) {
      throw new AppError(404, "Inventory record not found");
    }
    if (inventory.business.admin.userId !== userId) {
      throw new AppError(403, "You do not manage this inventory");
    }
    try {
      return await catalogRepository.applyMovement(
        inventoryId,
        inventory.productId,
        input.type,
        input.quantity,
        userId,
        input.notes,
      );
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
        throw new AppError(409, "This adjustment would make stock negative");
      }
      throw error;
    }
  },

  async listMovements(userId: string, inventoryId: string) {
    const inventory = await catalogRepository.findInventoryById(inventoryId);
    if (!inventory) {
      throw new AppError(404, "Inventory record not found");
    }
    if (inventory.business.admin.userId !== userId) {
      throw new AppError(403, "You do not manage this inventory");
    }
    return catalogRepository.listMovements(inventoryId);
  },
};
