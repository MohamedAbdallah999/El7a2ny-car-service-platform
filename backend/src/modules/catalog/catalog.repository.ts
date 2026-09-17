import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";

export interface ProductListFilters {
  businessId?: string;
  categoryId?: string;
  brand?: string;
  search?: string;
}

export const catalogRepository = {
  findAdminIdByUserId(userId: string) {
    return prisma.admin
      .findUnique({ where: { userId }, select: { id: true } })
      .then((admin) => admin?.id ?? null);
  },

  findBusinessOwnedBy(businessId: string, adminId: string) {
    return prisma.business.findFirst({
      where: { id: businessId, adminId, deletedAt: null },
    });
  },

  findBranchInBusiness(branchId: string, businessId: string) {
    return prisma.businessBranch.findFirst({
      where: { id: branchId, businessId },
    });
  },

  // -- categories ----------------------------------------------------------
  listCategories(activeOnly: boolean) {
    return prisma.productCategory.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  findCategoryById(id: string) {
    return prisma.productCategory.findUnique({ where: { id } });
  },

  async categorySlugExists(slug: string): Promise<boolean> {
    const existing = await prisma.productCategory.findUnique({
      where: { slug },
      select: { id: true },
    });
    return existing !== null;
  },

  createCategory(data: Prisma.ProductCategoryCreateInput) {
    return prisma.productCategory.create({ data });
  },

  updateCategory(id: string, data: Prisma.ProductCategoryUpdateInput) {
    return prisma.productCategory.update({ where: { id }, data });
  },

  // -- products --------------------------------------------------------
  async slugExists(slug: string): Promise<boolean> {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    return existing !== null;
  },

  async skuExists(sku: string): Promise<boolean> {
    const existing = await prisma.product.findUnique({
      where: { sku },
      select: { id: true },
    });
    return existing !== null;
  },

  create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data });
  },

  findById(id: string) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        business: { include: { admin: true } },
        images: { orderBy: { sortOrder: "asc" } },
        vehicleCompatibilities: { include: { make: true, model: true } },
      },
    });
  },

  findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        business: true,
        images: { orderBy: { sortOrder: "asc" } },
        vehicleCompatibilities: { include: { make: true, model: true } },
      },
    });
  },

  async listPublic(filters: ProductListFilters, skip: number, take: number) {
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      deletedAt: null,
      business: { status: "ACTIVE", deletedAt: null },
      ...(filters.businessId ? { businessId: filters.businessId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.brand ? { brand: { equals: filters.brand, mode: "insensitive" } } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { category: true, images: { where: { isPrimary: true }, take: 1 } },
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: "DISCONTINUED" },
    });
  },

  addImage(
    productId: string,
    data: Omit<Prisma.ProductImageUncheckedCreateInput, "productId">,
  ) {
    return prisma.productImage.create({ data: { ...data, productId } });
  },

  removeImage(id: string) {
    return prisma.productImage.delete({ where: { id } });
  },

  findImageById(id: string) {
    return prisma.productImage.findUnique({
      where: { id },
      include: { product: { include: { business: { include: { admin: true } } } } },
    });
  },

  addCompatibility(
    productId: string,
    data: Omit<Prisma.ProductVehicleCompatibilityUncheckedCreateInput, "productId">,
  ) {
    return prisma.productVehicleCompatibility.create({ data: { ...data, productId } });
  },

  removeCompatibility(id: string) {
    return prisma.productVehicleCompatibility.delete({ where: { id } });
  },

  findCompatibilityById(id: string) {
    return prisma.productVehicleCompatibility.findUnique({
      where: { id },
      include: { product: { include: { business: { include: { admin: true } } } } },
    });
  },

  // -- inventory -------------------------------------------------------
  async inventoryExists(branchId: string, productId: string): Promise<boolean> {
    const existing = await prisma.inventory.findUnique({
      where: { branchId_productId: { branchId, productId } },
      select: { id: true },
    });
    return existing !== null;
  },

  createInventory(data: Prisma.InventoryUncheckedCreateInput) {
    return prisma.inventory.create({ data });
  },

  findInventoryById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
      include: { business: { include: { admin: true } }, product: true, branch: true },
    });
  },

  listInventory(businessId: string, branchId: string | undefined, skip: number, take: number) {
    const where: Prisma.InventoryWhereInput = {
      businessId,
      ...(branchId ? { branchId } : {}),
    };
    return Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        include: { product: true, branch: true },
      }),
      prisma.inventory.count({ where }),
    ]);
  },

  async applyMovement(
    inventoryId: string,
    productId: string,
    type: Prisma.InventoryMovementUncheckedCreateInput["type"],
    delta: number,
    performedByUserId: string,
    notes: string | undefined,
  ) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUniqueOrThrow({
        where: { id: inventoryId },
      });
      const newQuantity = inventory.quantity + delta;
      if (newQuantity < 0) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const updated = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: newQuantity,
          availableQuantity: newQuantity - inventory.reservedQuantity,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryId,
          productId,
          type,
          quantity: delta,
          previousQuantity: inventory.quantity,
          newQuantity,
          performedByUserId,
          notes,
        },
      });

      return updated;
    });
  },

  listMovements(inventoryId: string) {
    return prisma.inventoryMovement.findMany({
      where: { inventoryId },
      orderBy: { createdAt: "desc" },
      include: { performedBy: true },
    });
  },
};
