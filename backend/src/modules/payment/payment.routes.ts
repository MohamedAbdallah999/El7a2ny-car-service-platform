import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  confirmPayment,
  createPayment,
  createRefund,
  failPayment,
  getPayment,
  listBusinessPayments,
  listMyPayments,
  updateRefundStatus,
} from "./payment.controller.js";
import {
  createPaymentSchema,
  createRefundSchema,
  failPaymentSchema,
  paymentListQuerySchema,
  refundStatusUpdateSchema,
} from "./payment.validation.js";

const router = Router();
const customer = authorize(UserRole.CUSTOMER);
const admin = authorize(UserRole.ADMIN);
const anyAuthenticated = authorize(
  UserRole.CUSTOMER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
);

router.post(
  "/",
  authenticate,
  customer,
  validateBody(createPaymentSchema, "Invalid payment data", true),
  createPayment,
);
router.get(
  "/mine",
  authenticate,
  customer,
  validateQuery(paymentListQuerySchema, "Invalid query parameters", true),
  listMyPayments,
);
router.get(
  "/business",
  authenticate,
  admin,
  validateQuery(paymentListQuerySchema, "Invalid query parameters", true),
  listBusinessPayments,
);
router.get("/:paymentId", authenticate, anyAuthenticated, getPayment);
router.post(
  "/:paymentId/confirm",
  authenticate,
  anyAuthenticated,
  confirmPayment,
);
router.post(
  "/:paymentId/fail",
  authenticate,
  anyAuthenticated,
  validateBody(failPaymentSchema, "Invalid failure reason", true),
  failPayment,
);
router.post(
  "/:paymentId/refunds",
  authenticate,
  anyAuthenticated,
  validateBody(createRefundSchema, "Invalid refund data", true),
  createRefund,
);
router.patch(
  "/refunds/:refundId/status",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validateBody(refundStatusUpdateSchema, "Invalid refund status", true),
  updateRefundStatus,
);

export default router;
