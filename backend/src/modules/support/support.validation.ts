import {
  SUPPORT_CATEGORY_VALUES,
  SUPPORT_PRIORITY_VALUES,
  SUPPORT_TICKET_STATUS_VALUES,
} from "@car-platform/constants";
import { paginationQuerySchema, uuidSchema, z } from "@car-platform/validation";

export const createTicketSchema = z
  .object({
    subject: z.string().trim().min(1).max(250),
    category: z.enum(SUPPORT_CATEGORY_VALUES),
    priority: z.enum(SUPPORT_PRIORITY_VALUES).optional(),
    message: z.string().trim().min(1).max(4000),
  })
  .strict();

export const ticketStatusUpdateSchema = z
  .object({ status: z.enum(SUPPORT_TICKET_STATUS_VALUES) })
  .strict();

export const assignTicketSchema = z
  .object({ assignedToUserId: uuidSchema })
  .strict();

export const ticketListQuerySchema = paginationQuerySchema
  .extend({
    status: z.enum(SUPPORT_TICKET_STATUS_VALUES).optional(),
    category: z.enum(SUPPORT_CATEGORY_VALUES).optional(),
  })
  .strict();

export const createTicketMessageSchema = z
  .object({ message: z.string().trim().min(1).max(4000) })
  .strict();

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketStatusUpdateInput = z.infer<typeof ticketStatusUpdateSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type TicketListQueryInput = z.infer<typeof ticketListQuerySchema>;
export type CreateTicketMessageInput = z.infer<
  typeof createTicketMessageSchema
>;
