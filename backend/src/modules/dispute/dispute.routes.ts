import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  addDisputeAttachment,
  addDisputeMessage,
  createDispute,
  getDispute,
  listAllDisputes,
  listBusinessDisputes,
  listDisputeAttachments,
  listDisputeMessages,
  listMyDisputes,
  updateDisputeStatus,
} from "./dispute.controller.js";
import {
  createDisputeAttachmentSchema,
  createDisputeMessageSchema,
  createDisputeSchema,
  disputeListQuerySchema,
  disputeStatusUpdateSchema,
} from "./dispute.validation.js";

const router = Router();
const customer = authorize(UserRole.CUSTOMER);
const admin = authorize(UserRole.ADMIN);
const superAdmin = authorize(UserRole.SUPER_ADMIN);
const anyAuthenticated = authorize(
  UserRole.CUSTOMER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
);

router.post(
  "/",
  authenticate,
  customer,
  validateBody(createDisputeSchema, "Invalid dispute data", true),
  createDispute,
);
router.get(
  "/mine",
  authenticate,
  customer,
  validateQuery(disputeListQuerySchema, "Invalid query parameters", true),
  listMyDisputes,
);
router.get(
  "/business",
  authenticate,
  admin,
  validateQuery(disputeListQuerySchema, "Invalid query parameters", true),
  listBusinessDisputes,
);
router.get(
  "/",
  authenticate,
  superAdmin,
  validateQuery(disputeListQuerySchema, "Invalid query parameters", true),
  listAllDisputes,
);
router.get("/:disputeId", authenticate, anyAuthenticated, getDispute);
router.patch(
  "/:disputeId/status",
  authenticate,
  superAdmin,
  validateBody(disputeStatusUpdateSchema, "Invalid status update", true),
  updateDisputeStatus,
);
router.get(
  "/:disputeId/messages",
  authenticate,
  anyAuthenticated,
  listDisputeMessages,
);
router.post(
  "/:disputeId/messages",
  authenticate,
  anyAuthenticated,
  validateBody(createDisputeMessageSchema, "Invalid message", true),
  addDisputeMessage,
);
router.get(
  "/:disputeId/attachments",
  authenticate,
  anyAuthenticated,
  listDisputeAttachments,
);
router.post(
  "/:disputeId/attachments",
  authenticate,
  anyAuthenticated,
  validateBody(createDisputeAttachmentSchema, "Invalid attachment data", true),
  addDisputeAttachment,
);

export default router;
