import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  getSetting,
  listAuditLogs,
  listSettings,
  upsertSetting,
} from "./platform-admin.controller.js";
import {
  auditLogListQuerySchema,
  upsertSettingSchema,
} from "./platform-admin.validation.js";

const router = Router();
router.use(authenticate, authorize(UserRole.SUPER_ADMIN));

router.get(
  "/audit-logs",
  validateQuery(auditLogListQuerySchema, "Invalid query parameters", true),
  listAuditLogs,
);
router.get("/settings", listSettings);
router.get("/settings/:key", getSetting);
router.put(
  "/settings/:key",
  validateBody(upsertSettingSchema, "Invalid setting data", true),
  upsertSetting,
);

export default router;
