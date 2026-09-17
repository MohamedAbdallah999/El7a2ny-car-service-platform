import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { supportService } from "./support.service.js";
import type {
  AssignTicketInput,
  CreateTicketInput,
  CreateTicketMessageInput,
  TicketListQueryInput,
  TicketStatusUpdateInput,
} from "./support.validation.js";

const requireRole = (req: Request) => {
  const role = req.user?.role;
  if (!role) {
    throw new AppError(401, "Unauthorized");
  }
  return role;
};

export const createTicket = async (req: Request, res: Response) => {
  const ticket = await supportService.create(
    requireUserId(req),
    req.body as CreateTicketInput,
  );
  res.status(201).json({ ticket });
};

export const listMyTickets = async (req: Request, res: Response) => {
  const result = await supportService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as TicketListQueryInput,
  );
  res.status(200).json(result);
};

export const listAllTickets = async (req: Request, res: Response) => {
  const result = await supportService.listAll(
    req.validatedQuery as unknown as TicketListQueryInput,
  );
  res.status(200).json(result);
};

export const getTicket = async (req: Request, res: Response) => {
  const ticket = await supportService.getById(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "ticketId"),
  );
  res.status(200).json({ ticket });
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  const ticket = await supportService.updateStatus(
    requireParam(req, "ticketId"),
    req.body as TicketStatusUpdateInput,
  );
  res.status(200).json({ ticket });
};

export const assignTicket = async (req: Request, res: Response) => {
  const ticket = await supportService.assign(
    requireParam(req, "ticketId"),
    req.body as AssignTicketInput,
  );
  res.status(200).json({ ticket });
};

export const addTicketMessage = async (req: Request, res: Response) => {
  const message = await supportService.addMessage(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "ticketId"),
    req.body as CreateTicketMessageInput,
  );
  res.status(201).json({ message });
};

export const listTicketMessages = async (req: Request, res: Response) => {
  const messages = await supportService.listMessages(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "ticketId"),
  );
  res.status(200).json({ messages });
};
