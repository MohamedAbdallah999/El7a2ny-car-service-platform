import { Router } from "express";
import { UserRole } from "../../generated/prisma/client.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  getAdminCustomer,
  getAdminCustomers,
  getAdminDashboard,
} from "./dashboard.controller.js";
import {
  validateParams,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import {
  adminCustomerParamsSchema,
  adminCustomersQuerySchema,
} from "./dashboard.validation.js";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize(UserRole.ADMIN),
  getAdminDashboard,
);
router.get(
  "/admin/customers",
  authenticate,
  authorize(UserRole.ADMIN),
  validateQuery(adminCustomersQuerySchema, "Invalid customer query", true),
  getAdminCustomers,
);
router.get(
  "/admin/customers/:customerId",
  authenticate,
  authorize(UserRole.ADMIN),
  validateParams(adminCustomerParamsSchema, "Invalid customer ID", true),
  validateQuery(adminCustomersQuerySchema, "Invalid customer query", true),
  getAdminCustomer,
);

export default router;
