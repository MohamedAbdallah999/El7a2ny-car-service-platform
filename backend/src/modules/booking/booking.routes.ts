import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  createBooking,
  getBooking,
  listBookingHistory,
  listBusinessBookings,
  listMyBookings,
  updateBookingStatus,
} from "./booking.controller.js";
import {
  bookingListQuerySchema,
  bookingStatusUpdateSchema,
  createBookingSchema,
} from "./booking.validation.js";

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
  validateBody(createBookingSchema, "Invalid booking data", true),
  createBooking,
);
router.get(
  "/mine",
  authenticate,
  customer,
  validateQuery(bookingListQuerySchema, "Invalid query parameters", true),
  listMyBookings,
);
router.get(
  "/business",
  authenticate,
  admin,
  validateQuery(bookingListQuerySchema, "Invalid query parameters", true),
  listBusinessBookings,
);
router.get("/:bookingId", authenticate, anyAuthenticated, getBooking);
router.patch(
  "/:bookingId/status",
  authenticate,
  anyAuthenticated,
  validateBody(bookingStatusUpdateSchema, "Invalid status update", true),
  updateBookingStatus,
);
router.get(
  "/:bookingId/history",
  authenticate,
  anyAuthenticated,
  listBookingHistory,
);

export default router;
