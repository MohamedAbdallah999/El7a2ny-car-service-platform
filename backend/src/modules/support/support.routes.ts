import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  addTicketMessage,
  assignTicket,
  createTicket,
  getTicket,
  listAllTickets,
  listMyTickets,
  listTicketMessages,
  updateTicketStatus,
} from "./support.controller.js";
import {
  assignTicketSchema,
  createTicketMessageSchema,
  createTicketSchema,
  ticketListQuerySchema,
  ticketStatusUpdateSchema,
} from "./support.validation.js";

const router = Router();
const superAdmin = authorize(UserRole.SUPER_ADMIN);
const anyAuthenticated = authorize(
  UserRole.CUSTOMER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
);

router.use(authenticate);

router.post(
  "/",
  anyAuthenticated,
  validateBody(createTicketSchema, "Invalid ticket data", true),
  createTicket,
);
router.get(
  "/mine",
  anyAuthenticated,
  validateQuery(ticketListQuerySchema, "Invalid query parameters", true),
  listMyTickets,
);
router.get(
  "/",
  superAdmin,
  validateQuery(ticketListQuerySchema, "Invalid query parameters", true),
  listAllTickets,
);
router.get("/:ticketId", anyAuthenticated, getTicket);
router.patch(
  "/:ticketId/status",
  superAdmin,
  validateBody(ticketStatusUpdateSchema, "Invalid status update", true),
  updateTicketStatus,
);
router.patch(
  "/:ticketId/assign",
  superAdmin,
  validateBody(assignTicketSchema, "Invalid assignment", true),
  assignTicket,
);
router.get("/:ticketId/messages", anyAuthenticated, listTicketMessages);
router.post(
  "/:ticketId/messages",
  anyAuthenticated,
  validateBody(createTicketMessageSchema, "Invalid message", true),
  addTicketMessage,
);

export default router;
