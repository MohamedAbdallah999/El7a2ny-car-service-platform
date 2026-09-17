import {
  buildPaginationMeta,
  generateUniqueSlug,
  normalizePagination,
} from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import {
  businessRepository,
  timeStringToDate,
} from "./business.repository.js";
import type {
  BusinessHoursInput,
  BusinessListQueryInput,
  BusinessStatusInput,
  BusinessVerificationInput,
  CreateBranchInput,
  CreateBusinessInput,
  CreateDocumentInput,
  CreateHolidayInput,
  ReviewDocumentInput,
  UpdateBranchInput,
  UpdateBusinessInput,
} from "./business.validation.js";

const requireAdminId = async (userId: string): Promise<string> => {
  const adminId = await businessRepository.findAdminIdByUserId(userId);
  if (!adminId) {
    throw new AppError(403, "Only admin accounts can manage businesses");
  }
  return adminId;
};

const loadOwnedBusiness = async (businessId: string, userId: string) => {
  const business = await businessRepository.findById(businessId);
  if (!business) {
    throw new AppError(404, "Business not found");
  }
  if (business.admin.userId !== userId) {
    throw new AppError(403, "You do not manage this business");
  }
  return business;
};

const loadOwnedBranch = async (branchId: string, userId: string) => {
  const branch = await businessRepository.findBranchById(branchId);
  if (!branch) {
    throw new AppError(404, "Branch not found");
  }
  if (branch.business.admin.userId !== userId) {
    throw new AppError(403, "You do not manage this branch");
  }
  return branch;
};

export const businessService = {
  async create(userId: string, input: CreateBusinessInput) {
    const adminId = await requireAdminId(userId);
    const slug = await generateUniqueSlug(input.name, (candidate) =>
      businessRepository.slugExists(candidate),
    );
    return businessRepository.createBusiness(adminId, slug, input);
  },

  async listPublic(query: BusinessListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await businessRepository.listPublic(
      { businessType: query.businessType, city: query.city, search: query.search },
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getBySlug(slug: string) {
    const business = await businessRepository.findBySlug(slug);
    if (!business) {
      throw new AppError(404, "Business not found");
    }
    return business;
  },

  async listMine(userId: string, query: BusinessListQueryInput) {
    const adminId = await requireAdminId(userId);
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await businessRepository.listForAdmin(
      adminId,
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listAll(
    query: BusinessListQueryInput & { verificationStatus?: string },
  ) {
    const { page, limit, skip, take } = normalizePagination(query);
    const { items, total } = await businessRepository.listAll(
      {
        businessType: query.businessType,
        search: query.search,
        verificationStatus:
          query.verificationStatus as
            | "PENDING"
            | "UNDER_REVIEW"
            | "VERIFIED"
            | "REJECTED"
            | undefined,
      },
      skip,
      take,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(businessId: string) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new AppError(404, "Business not found");
    }
    return business;
  },

  async update(userId: string, businessId: string, input: UpdateBusinessInput) {
    await loadOwnedBusiness(businessId, userId);
    return businessRepository.updateBusiness(businessId, input);
  },

  async setVerification(businessId: string, input: BusinessVerificationInput) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new AppError(404, "Business not found");
    }
    return businessRepository.updateVerification(businessId, input.status);
  },

  async setStatus(businessId: string, input: BusinessStatusInput) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new AppError(404, "Business not found");
    }
    return businessRepository.updateStatus(businessId, input.status);
  },

  async createBranch(userId: string, businessId: string, input: CreateBranchInput) {
    await loadOwnedBusiness(businessId, userId);
    return businessRepository.createBranch(businessId, input);
  },

  async listBranches(businessId: string) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new AppError(404, "Business not found");
    }
    return businessRepository.listBranches(businessId);
  },

  async updateBranch(userId: string, branchId: string, input: UpdateBranchInput) {
    const branch = await loadOwnedBranch(branchId, userId);
    return businessRepository.updateBranch(branchId, branch.businessId, input);
  },

  async closeBranch(userId: string, branchId: string) {
    await loadOwnedBranch(branchId, userId);
    return businessRepository.closeBranch(branchId);
  },

  async setHours(userId: string, branchId: string, input: BusinessHoursInput) {
    await loadOwnedBranch(branchId, userId);
    const hours = input.hours.map((hour) => ({
      dayOfWeek: hour.dayOfWeek,
      isClosed: hour.isClosed,
      openingTime: hour.openingTime ? timeStringToDate(hour.openingTime) : null,
      closingTime: hour.closingTime ? timeStringToDate(hour.closingTime) : null,
    }));
    return businessRepository.setHours(branchId, hours);
  },

  async addHoliday(userId: string, branchId: string, input: CreateHolidayInput) {
    await loadOwnedBranch(branchId, userId);
    return businessRepository.createHoliday(branchId, input.date, input.reason);
  },

  async listHolidays(branchId: string) {
    const branch = await businessRepository.findBranchById(branchId);
    if (!branch) {
      throw new AppError(404, "Branch not found");
    }
    return businessRepository.listHolidays(branchId);
  },

  async removeHoliday(userId: string, holidayId: string) {
    const holiday = await businessRepository.findHolidayById(holidayId);
    if (!holiday) {
      throw new AppError(404, "Holiday not found");
    }
    if (holiday.branch.business.admin.userId !== userId) {
      throw new AppError(403, "You do not manage this branch");
    }
    await businessRepository.deleteHoliday(holidayId);
  },

  async addDocument(userId: string, businessId: string, input: CreateDocumentInput) {
    await loadOwnedBusiness(businessId, userId);
    return businessRepository.createDocument(businessId, input);
  },

  async listDocuments(userId: string, businessId: string, isSuperAdmin: boolean) {
    if (!isSuperAdmin) {
      await loadOwnedBusiness(businessId, userId);
    }
    return businessRepository.listDocuments(businessId);
  },

  async reviewDocument(
    reviewerId: string,
    documentId: string,
    input: ReviewDocumentInput,
  ) {
    const document = await businessRepository.findDocumentById(documentId);
    if (!document) {
      throw new AppError(404, "Document not found");
    }
    return businessRepository.reviewDocument(
      documentId,
      reviewerId,
      input.status,
      input.rejectionReason,
    );
  },
};
