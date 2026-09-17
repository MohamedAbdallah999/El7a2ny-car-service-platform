import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  createCommissionRule,
  createPayout,
  listCommissionRules,
  listPayouts,
  listTransactions,
  updatePayoutStatus,
} from "./financial.controller.js";
import {
  businessScopedQuerySchema,
  createCommissionRuleSchema,
  createPayoutSchema,
  payoutStatusUpdateSchema,
} from "./financial.validation.js";

const router = Router();
const superAdmin = authorize(UserRole.SUPER_ADMIN);
const adminOrSuperAdmin = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.get("/commission-rules", authenticate, adminOrSuperAdmin, listCommissionRules);
router.post(
  "/commission-rules",
  authenticate,
  superAdmin,
  validateBody(createCommissionRuleSchema, "Invalid commission rule data", true),
  createCommissionRule,
);

router.get(
  "/transactions",
  authenticate,
  adminOrSuperAdmin,
  validateQuery(businessScopedQuerySchema, "Invalid query parameters", true),
  listTransactions,
);

router.get(
  "/payouts",
  authenticate,
  adminOrSuperAdmin,
  validateQuery(businessScopedQuerySchema, "Invalid query parameters", true),
  listPayouts,
);
router.post(
  "/payouts",
  authenticate,
  superAdmin,
  validateBody(createPayoutSchema, "Invalid payout data", true),
  createPayout,
);
router.patch(
  "/payouts/:payoutId/status",
  authenticate,
  superAdmin,
  validateBody(payoutStatusUpdateSchema, "Invalid payout status", true),
  updatePayoutStatus,
);

export default router;
