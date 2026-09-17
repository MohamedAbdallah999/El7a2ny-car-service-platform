import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  registerPushDevice,
  unregisterPushDevice,
} from "./notification.controller.js";
import {
  notificationListQuerySchema,
  registerPushDeviceSchema,
} from "./notification.validation.js";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  validateQuery(notificationListQuerySchema, "Invalid query parameters", true),
  listMyNotifications,
);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:notificationId/read", markNotificationRead);
router.post(
  "/devices",
  validateBody(registerPushDeviceSchema, "Invalid device data", true),
  registerPushDevice,
);
router.delete("/devices/:deviceId", unregisterPushDevice);

export default router;
