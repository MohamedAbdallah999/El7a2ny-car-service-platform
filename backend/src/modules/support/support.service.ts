import { buildPaginationMeta, generateReferenceNumber, normalizePagination } from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma, UserRole } from "../../generated/prisma/client.js";
import type {
  AssignTicketInput,
  CreateTicketInput,
  CreateTicketMessageInput,
  TicketListQueryInput,
  TicketStatusUpdateInput,
} from "./support.validation.js";

const MAX_NUMBER_ATTEMPTS = 5;

const generateUniqueTicketNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt += 1) {
    const candidate = generateReferenceNumber("TKT");
    const exists = await prisma.supportTicket.findUnique({
      where: { ticketNumber: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }
  throw new AppError(500, "Could not generate a unique ticket number");
};

const TICKET_INCLUDE = {
  user: true,
  assignedTo: true,
} satisfies Prisma.SupportTicketInclude;

export const supportService = {
  async create(userId: string, input: CreateTicketInput) {
    const ticketNumber = await generateUniqueTicketNumber();
    const { message, ...rest } = input;
    return prisma.supportTicket.create({
      data: {
        ...rest,
        ticketNumber,
        userId,
        status: "OPEN",
        messages: { create: { senderUserId: userId, message } },
      },
      include: TICKET_INCLUDE,
    });
  },

  async listMine(userId: string, query: TicketListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.SupportTicketWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.supportTicket.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: TICKET_INCLUDE }),
      prisma.supportTicket.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listAll(query: TicketListQueryInput) {
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.SupportTicketWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.supportTicket.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: TICKET_INCLUDE }),
      prisma.supportTicket.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(userId: string, role: UserRole, ticketId: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: TICKET_INCLUDE,
    });
    if (!ticket) {
      throw new AppError(404, "Support ticket not found");
    }
    if (
      role !== "SUPER_ADMIN" &&
      ticket.userId !== userId &&
      ticket.assignedToUserId !== userId
    ) {
      throw new AppError(403, "You cannot view this ticket");
    }
    return ticket;
  },

  async updateStatus(ticketId: string, input: TicketStatusUpdateInput) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new AppError(404, "Support ticket not found");
    }
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: input.status,
        ...(input.status === "RESOLVED" || input.status === "CLOSED"
          ? { resolvedAt: new Date() }
          : {}),
      },
    });
  },

  async assign(ticketId: string, input: AssignTicketInput) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new AppError(404, "Support ticket not found");
    }
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedToUserId: input.assignedToUserId, status: "IN_PROGRESS" },
    });
  },

  async addMessage(
    userId: string,
    role: UserRole,
    ticketId: string,
    input: CreateTicketMessageInput,
  ) {
    const ticket = await this.getById(userId, role, ticketId);
    return prisma.supportTicketMessage.create({
      data: { ticketId: ticket.id, senderUserId: userId, message: input.message },
    });
  },

  async listMessages(userId: string, role: UserRole, ticketId: string) {
    await this.getById(userId, role, ticketId);
    return prisma.supportTicketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });
  },
};
