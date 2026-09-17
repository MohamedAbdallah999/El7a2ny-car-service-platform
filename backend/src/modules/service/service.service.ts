import {
  buildPaginationMeta,
  generateUniqueSlug,
  normalizePagination,
} from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { serviceRepository } from "./service.repository.js";
import type {
  CreateCategoryInput,
  CreateCompatibilityInput,
  CreateServiceInput,
  ServiceListQueryInput,
  UpdateCategoryInput,
  UpdateServiceInput,
} from "./service.validation.js";

const requireAdminId = async (userId: string): Promise<string> => {
  const adminId = await serviceRepository.findAdminIdByUserId(userId);
  if (!adminId) {
    throw new AppError(403, "Only admin accounts can manage services");
  }
  return adminId;
};

const loadOwnedService = async (serviceId: string, userId: string) => {
  const service = await serviceRepository.findById(serviceId);
  if (!service) {
    throw new AppError(404, "Service not found");
  }
  if (service.business.admin.userId !== userId) {
    throw new AppError(403, "You do not manage this service");
  }
  return service;
};

export const serviceModuleService = {
  listCategories(includeInactive: boolean) {
    return serviceRepository.listCategories(!includeInactive);
  },

  async createCategory(input: CreateCategoryInput) {
    if (input.parentId) {
      const parent = await serviceRepository.findCategoryById(input.parentId);
      if (!parent) {
        throw new AppError(400, "Unknown parent category");
      }
    }
    const { parentId, ...rest } = input;
    const slug = await generateUniqueSlug(input.name, (candidate) =>
      serviceRepository.categorySlugExists(candidate),
    );
    return serviceRepository.createCategory({
      ...rest,
      slug,
      ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
    });
  },

  async updateCategory(categoryId: string, input: UpdateCategoryInput) {
    const category = await serviceRepository.findCategoryById(categoryId);
    if (!category) {
      throw new AppError(404, "Service category not found");
    }
    if (input.parentId) {
      const parent = await serviceRepository.findCategoryById(input.parentId);
      if (!parent) {
        throw new AppError(400, "Unknown parent category");
      }
    }
    const { parentId, ...rest } = input;
    return serviceRepository.updateCategory(categoryId, {
      ...rest,
      ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
    });
  },

  async listPublic(query: ServiceListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await serviceRepository.listPublic(
      {
        businessId: query.businessId,
        branchId: query.branchId,
        categoryId: query.categoryId,
        search: query.search,
      },
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(serviceId: string) {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new AppError(404, "Service not found");
    }
    return service;
  },

  async create(userId: string, input: CreateServiceInput) {
    const adminId = await requireAdminId(userId);
    const business = await serviceRepository.findBusinessOwnedBy(
      input.businessId,
      adminId,
    );
    if (!business) {
      throw new AppError(403, "You do not manage this business");
    }
    if (input.branchId) {
      const branch = await serviceRepository.findBranchInBusiness(
        input.branchId,
        input.businessId,
      );
      if (!branch) {
        throw new AppError(400, "Branch does not belong to this business");
      }
    }
    const category = await serviceRepository.findCategoryById(input.categoryId);
    if (!category) {
      throw new AppError(400, "Unknown service category");
    }
    return serviceRepository.create(input);
  },

  async update(userId: string, serviceId: string, input: UpdateServiceInput) {
    const service = await loadOwnedService(serviceId, userId);
    if (input.branchId) {
      const branch = await serviceRepository.findBranchInBusiness(
        input.branchId,
        service.businessId,
      );
      if (!branch) {
        throw new AppError(400, "Branch does not belong to this business");
      }
    }
    if (input.categoryId) {
      const category = await serviceRepository.findCategoryById(
        input.categoryId,
      );
      if (!category) {
        throw new AppError(400, "Unknown service category");
      }
    }
    return serviceRepository.update(serviceId, input);
  },

  async remove(userId: string, serviceId: string) {
    await loadOwnedService(serviceId, userId);
    await serviceRepository.softDelete(serviceId);
  },

  async addCompatibility(
    userId: string,
    serviceId: string,
    input: CreateCompatibilityInput,
  ) {
    await loadOwnedService(serviceId, userId);
    return serviceRepository.addCompatibility(serviceId, input);
  },

  async removeCompatibility(userId: string, compatibilityId: string) {
    const compatibility =
      await serviceRepository.findCompatibilityById(compatibilityId);
    if (!compatibility) {
      throw new AppError(404, "Compatibility rule not found");
    }
    if (compatibility.service.business.admin.userId !== userId) {
      throw new AppError(403, "You do not manage this service");
    }
    await serviceRepository.removeCompatibility(compatibilityId);
  },
};
