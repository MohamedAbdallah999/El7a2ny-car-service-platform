import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  addServiceRequestAttachment,
  addServiceRequestMessage,
  acceptServiceRequest,
  createServiceRequest,
  editPendingServiceRequest,
  getServiceRequest,
  listBusinessServiceRequests,
  listMyServiceRequests,
  listServiceRequestAttachments,
  listServiceRequestMessages,
  updateServiceRequestStatus,
} from "./service-request.controller.js";
import {
  createAttachmentSchema,
  createMessageSchema,
  createServiceRequestSchema,
  serviceRequestListQuerySchema,
  serviceRequestStatusUpdateSchema,
  updatePendingServiceRequestSchema,
} from "./service-request.validation.js";

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
  validateBody(
    createServiceRequestSchema,
    "Invalid service request data",
    true,
  ),
  createServiceRequest,
);
router.get(
  "/mine",
  authenticate,
  customer,
  validateQuery(
    serviceRequestListQuerySchema,
    "Invalid query parameters",
    true,
  ),
  listMyServiceRequests,
);
router.get(
  "/business",
  authenticate,
  admin,
  validateQuery(
    serviceRequestListQuerySchema,
    "Invalid query parameters",
    true,
  ),
  listBusinessServiceRequests,
);
router.get("/:requestId", authenticate, anyAuthenticated, getServiceRequest);
router.patch(
  "/:requestId",
  authenticate,
  admin,
  validateBody(
    updatePendingServiceRequestSchema,
    "Invalid service request update",
    true,
  ),
  editPendingServiceRequest,
);
router.post("/:requestId/accept", authenticate, admin, acceptServiceRequest);
router.patch(
  "/:requestId/status",
  authenticate,
  anyAuthenticated,
  validateBody(serviceRequestStatusUpdateSchema, "Invalid status update", true),
  updateServiceRequestStatus,
);
router.get(
  "/:requestId/messages",
  authenticate,
  anyAuthenticated,
  listServiceRequestMessages,
);
router.post(
  "/:requestId/messages",
  authenticate,
  anyAuthenticated,
  validateBody(createMessageSchema, "Invalid message", true),
  addServiceRequestMessage,
);
router.get(
  "/:requestId/attachments",
  authenticate,
  anyAuthenticated,
  listServiceRequestAttachments,
);
router.post(
  "/:requestId/attachments",
  authenticate,
  anyAuthenticated,
  validateBody(createAttachmentSchema, "Invalid attachment data", true),
  addServiceRequestAttachment,
);

export default router;
