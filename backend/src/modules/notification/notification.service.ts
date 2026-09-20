import { buildPaginationMeta, normalizePagination } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type {
  NotificationListQueryInput,
  RegisterPushDeviceInput,
} from "./notification.validation.js";

export const notificationService = {
  async listMine(userId: string, query: NotificationListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where = {
      userId,
      ...(query.unreadOnly ? { isRead: false } : {}),
    };
    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, unreadCount, meta: buildPaginationMeta(page, limit, total) };
  },

  async markRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      throw new AppError(404, "Notification not found");
    }
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },

  // Registers (or re-associates, if this device token was previously
  // registered to a different account) a push token for the signed-in
  // user. No push provider is wired up yet to actually send anything —
  // this only stores where a notification would be delivered.
  async registerDevice(userId: string, input: RegisterPushDeviceInput) {
    return prisma.pushDevice.upsert({
      where: { deviceToken: input.deviceToken },
      create: { ...input, userId, isActive: true, lastSeenAt: new Date() },
      update: { userId, platform: input.platform, isActive: true, lastSeenAt: new Date() },
    });
  },

  async unregisterDevice(userId: string, deviceId: string) {
    const device = await prisma.pushDevice.findUnique({ where: { id: deviceId } });
    if (!device || device.userId !== userId) {
      throw new AppError(404, "Device not found");
    }
    await prisma.pushDevice.update({
      where: { id: deviceId },
      data: { isActive: false },
    });
  },
};
