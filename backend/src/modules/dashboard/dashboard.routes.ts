import { Router } from "express";
import { UserRole } from "../../generated/prisma/client.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { getAdminDashboard } from "./dashboard.controller.js";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize(UserRole.ADMIN),
  getAdminDashboard,
);

export default router;
