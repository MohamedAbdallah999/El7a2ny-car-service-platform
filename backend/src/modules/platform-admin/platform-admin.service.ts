import { buildPaginationMeta, normalizePagination } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type {
  AuditLogListQueryInput,
  UpsertSettingInput,
} from "./platform-admin.validation.js";

export const platformAdminService = {
  async listAuditLogs(query: AuditLogListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.AuditLogWhereInput = {
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  listSettings() {
    return prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
  },

  async getSetting(key: string) {
    const setting = await prisma.platformSetting.findUnique({ where: { key } });
    if (!setting) {
      throw new AppError(404, "Setting not found");
    }
    return setting;
  },

  upsertSetting(key: string, updatedByUserId: string, input: UpsertSettingInput) {
    const value = input.value as Prisma.InputJsonValue;
    return prisma.platformSetting.upsert({
      where: { key },
      create: { key, value, description: input.description, updatedByUserId },
      update: { value, description: input.description, updatedByUserId },
    });
  },
};

// Records an administrative action for the audit trail. Exported so other
// modules can call it directly as they add moderation/administration
// endpoints — see the roadmap note that this hasn't been wired into every
// mutation yet, only into the call sites that use it explicitly.
export const recordAuditLog = (input: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string;
  userAgent?: string;
}) =>
  prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValues: input.oldValues as Prisma.InputJsonValue | undefined,
      newValues: input.newValues as Prisma.InputJsonValue | undefined,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
