import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  checkout,
  createShipment,
  getOrder,
  listBusinessOrders,
  listMyOrders,
  updateOrderStatus,
  updateShipmentStatus,
} from "./order.controller.js";
import {
  checkoutSchema,
  createShipmentSchema,
  orderListQuerySchema,
  orderStatusUpdateSchema,
  shipmentStatusUpdateSchema,
} from "./order.validation.js";

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
  validateBody(checkoutSchema, "Invalid checkout data", true),
  checkout,
);
router.get(
  "/mine",
  authenticate,
  customer,
  validateQuery(orderListQuerySchema, "Invalid query parameters", true),
  listMyOrders,
);
router.get(
  "/business",
  authenticate,
  admin,
  validateQuery(orderListQuerySchema, "Invalid query parameters", true),
  listBusinessOrders,
);
router.get("/:orderId", authenticate, anyAuthenticated, getOrder);
router.patch(
  "/:orderId/status",
  authenticate,
  anyAuthenticated,
  validateBody(orderStatusUpdateSchema, "Invalid status update", true),
  updateOrderStatus,
);
router.post(
  "/:orderId/shipments",
  authenticate,
  admin,
  validateBody(createShipmentSchema, "Invalid shipment data", true),
  createShipment,
);
router.patch(
  "/shipments/:shipmentId/status",
  authenticate,
  admin,
  validateBody(shipmentStatusUpdateSchema, "Invalid status update", true),
  updateShipmentStatus,
);

export default router;
