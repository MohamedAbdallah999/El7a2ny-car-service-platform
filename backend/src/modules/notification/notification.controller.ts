import type { Request, Response } from "express";
import { requireParam, requireUserId } from "../../utils/request.js";
import { notificationService } from "./notification.service.js";
import type {
  NotificationListQueryInput,
  RegisterPushDeviceInput,
} from "./notification.validation.js";

export const listMyNotifications = async (req: Request, res: Response) => {
  const result = await notificationService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as NotificationListQueryInput,
  );
  res.status(200).json(result);
};

export const markNotificationRead = async (req: Request, res: Response) => {
  const notification = await notificationService.markRead(
    requireUserId(req),
    requireParam(req, "notificationId"),
  );
  res.status(200).json({ notification });
};

export const markAllNotificationsRead = async (req: Request, res: Response) => {
  await notificationService.markAllRead(requireUserId(req));
  res.status(204).send();
};

export const registerPushDevice = async (req: Request, res: Response) => {
  const device = await notificationService.registerDevice(
    requireUserId(req),
    req.body as RegisterPushDeviceInput,
  );
  res.status(201).json({ device });
};

export const unregisterPushDevice = async (req: Request, res: Response) => {
  await notificationService.unregisterDevice(
    requireUserId(req),
    requireParam(req, "deviceId"),
  );
  res.status(204).send();
};
