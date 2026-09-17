import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";

export interface ServiceListFilters {
  businessId?: string;
  branchId?: string;
  categoryId?: string;
  search?: string;
}

export const serviceRepository = {
  listCategories(activeOnly: boolean) {
    return prisma.serviceCategory.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  findCategoryById(id: string) {
    return prisma.serviceCategory.findUnique({ where: { id } });
  },

  async categorySlugExists(slug: string): Promise<boolean> {
    const existing = await prisma.serviceCategory.findUnique({
      where: { slug },
      select: { id: true },
    });
    return existing !== null;
  },

  createCategory(data: Prisma.ServiceCategoryCreateInput) {
    return prisma.serviceCategory.create({ data });
  },

  updateCategory(id: string, data: Prisma.ServiceCategoryUpdateInput) {
    return prisma.serviceCategory.update({ where: { id }, data });
  },

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

  async listPublic(filters: ServiceListFilters, skip: number, take: number) {
    const where: Prisma.ServiceWhereInput = {
      isActive: true,
      deletedAt: null,
      business: { status: "ACTIVE", deletedAt: null },
      ...(filters.businessId ? { businessId: filters.businessId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { category: true, business: true },
      }),
      prisma.service.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.service.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        business: { include: { admin: true } },
        branch: true,
        vehicleCompatibilities: { include: { make: true, model: true } },
      },
    });
  },

  create(data: Prisma.ServiceUncheckedCreateInput) {
    return prisma.service.create({ data });
  },

  update(id: string, data: Prisma.ServiceUpdateInput) {
    return prisma.service.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.service.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  },

  addCompatibility(
    serviceId: string,
    data: { makeId?: string; modelId?: string; yearFrom?: number; yearTo?: number },
  ) {
    return prisma.serviceVehicleCompatibility.create({
      data: { ...data, serviceId },
    });
  },

  removeCompatibility(id: string) {
    return prisma.serviceVehicleCompatibility.delete({ where: { id } });
  },

  findCompatibilityById(id: string) {
    return prisma.serviceVehicleCompatibility.findUnique({
      where: { id },
      include: { service: { include: { business: { include: { admin: true } } } } },
    });
  },
};
