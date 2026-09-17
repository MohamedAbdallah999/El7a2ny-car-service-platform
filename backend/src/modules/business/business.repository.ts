import { prisma } from "../../config/database.js";
import type {
  BranchStatus,
  BusinessDocumentType,
  BusinessStatus,
  BusinessType,
  DocumentVerificationStatus,
  Prisma,
  VerificationStatus,
} from "../../generated/prisma/client.js";

export interface BusinessListFilters {
  businessType?: BusinessType;
  city?: string;
  search?: string;
}

// `1970-01-01` is an arbitrary, fixed epoch date: Prisma's `@db.Time` columns
// (BusinessHour.openingTime/closingTime) only ever read/write the time
// portion, so the date component just needs to be a valid, consistent
// placeholder.
export const timeStringToDate = (value: string): Date =>
  new Date(`1970-01-01T${value}:00.000Z`);

export const businessRepository = {
  findAdminIdByUserId(userId: string) {
    return prisma.admin
      .findUnique({ where: { userId }, select: { id: true } })
      .then((admin) => admin?.id ?? null);
  },

  createBusiness(
    adminId: string,
    slug: string,
    data: Omit<Prisma.BusinessUncheckedCreateInput, "adminId" | "slug">,
  ) {
    return prisma.business.create({ data: { ...data, adminId, slug } });
  },

  async slugExists(slug: string): Promise<boolean> {
    const existing = await prisma.business.findUnique({
      where: { slug },
      select: { id: true },
    });
    return existing !== null;
  },

  findById(id: string) {
    return prisma.business.findFirst({
      where: { id, deletedAt: null },
      include: { admin: true, branches: true },
    });
  },

  findBySlug(slug: string) {
    return prisma.business.findFirst({
      where: { slug, deletedAt: null },
      include: { branches: { where: { status: "ACTIVE" } } },
    });
  },

  async listPublic(
    filters: BusinessListFilters,
    skip: number,
    take: number,
  ) {
    const where: Prisma.BusinessWhereInput = {
      deletedAt: null,
      status: "ACTIVE",
      ...(filters.businessType ? { businessType: filters.businessType } : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" } }
        : {}),
      ...(filters.city
        ? { branches: { some: { city: { equals: filters.city, mode: "insensitive" } } } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take,
        orderBy: { averageRating: "desc" },
        include: { branches: { where: { status: "ACTIVE" }, take: 1 } },
      }),
      prisma.business.count({ where }),
    ]);

    return { items, total };
  },

  async listForAdmin(adminId: string, skip: number, take: number) {
    const where: Prisma.BusinessWhereInput = { adminId, deletedAt: null };
    const [items, total] = await Promise.all([
      prisma.business.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
      prisma.business.count({ where }),
    ]);
    return { items, total };
  },

  async listAll(
    filters: BusinessListFilters & { verificationStatus?: VerificationStatus },
    skip: number,
    take: number,
  ) {
    const where: Prisma.BusinessWhereInput = {
      deletedAt: null,
      ...(filters.businessType ? { businessType: filters.businessType } : {}),
      ...(filters.verificationStatus
        ? { verificationStatus: filters.verificationStatus }
        : {}),
      ...(filters.search
        ? { name: { contains: filters.search, mode: "insensitive" } }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.business.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { admin: { include: { user: true } } },
      }),
      prisma.business.count({ where }),
    ]);
    return { items, total };
  },

  updateBusiness(id: string, data: Prisma.BusinessUpdateInput) {
    return prisma.business.update({ where: { id }, data });
  },

  updateVerification(
    id: string,
    status: VerificationStatus,
  ) {
    return prisma.business.update({
      where: { id },
      data: { verificationStatus: status },
    });
  },

  updateStatus(id: string, status: BusinessStatus) {
    return prisma.business.update({ where: { id }, data: { status } });
  },

  createBranch(
    businessId: string,
    data: Omit<Prisma.BusinessBranchUncheckedCreateInput, "businessId">,
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.businessBranch.updateMany({
          where: { businessId },
          data: { isPrimary: false },
        });
      }
      return tx.businessBranch.create({ data: { ...data, businessId } });
    });
  },

  listBranches(businessId: string) {
    return prisma.businessBranch.findMany({
      where: { businessId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      include: { hours: true },
    });
  },

  findBranchById(id: string) {
    return prisma.businessBranch.findUnique({
      where: { id },
      include: { business: { include: { admin: true } }, hours: true, holidays: true },
    });
  },

  async updateBranch(
    id: string,
    businessId: string,
    data: Prisma.BusinessBranchUpdateInput & { isPrimary?: boolean },
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary === true) {
        await tx.businessBranch.updateMany({
          where: { businessId, id: { not: id } },
          data: { isPrimary: false },
        });
      }
      return tx.businessBranch.update({ where: { id }, data });
    });
  },

  closeBranch(id: string) {
    return prisma.businessBranch.update({
      where: { id },
      data: { status: "CLOSED" as BranchStatus },
    });
  },

  setHours(
    branchId: string,
    hours: { dayOfWeek: number; openingTime: Date | null; closingTime: Date | null; isClosed: boolean }[],
  ) {
    return prisma.$transaction(
      hours.map((hour) =>
        prisma.businessHour.upsert({
          where: { branchId_dayOfWeek: { branchId, dayOfWeek: hour.dayOfWeek } },
          create: { branchId, ...hour },
          update: hour,
        }),
      ),
    );
  },

  createHoliday(branchId: string, date: Date, reason?: string) {
    return prisma.businessHoliday.create({ data: { branchId, date, reason } });
  },

  listHolidays(branchId: string) {
    return prisma.businessHoliday.findMany({
      where: { branchId },
      orderBy: { date: "asc" },
    });
  },

  findHolidayById(id: string) {
    return prisma.businessHoliday.findUnique({
      where: { id },
      include: { branch: { include: { business: { include: { admin: true } } } } },
    });
  },

  deleteHoliday(id: string) {
    return prisma.businessHoliday.delete({ where: { id } });
  },

  createDocument(
    businessId: string,
    data: {
      documentType: BusinessDocumentType;
      documentNumber?: string;
      fileUrl: string;
    },
  ) {
    return prisma.businessVerificationDocument.create({
      data: { ...data, businessId },
    });
  },

  listDocuments(businessId: string) {
    return prisma.businessVerificationDocument.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  },

  findDocumentById(id: string) {
    return prisma.businessVerificationDocument.findUnique({
      where: { id },
      include: { business: { include: { admin: true } } },
    });
  },

  reviewDocument(
    id: string,
    reviewedByUserId: string,
    status: DocumentVerificationStatus,
    rejectionReason?: string,
  ) {
    return prisma.businessVerificationDocument.update({
      where: { id },
      data: { status, reviewedByUserId, reviewedAt: new Date(), rejectionReason },
    });
  },
};
