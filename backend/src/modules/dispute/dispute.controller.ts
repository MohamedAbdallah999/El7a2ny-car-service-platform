import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { disputeService } from "./dispute.service.js";
import type {
  CreateDisputeAttachmentInput,
  CreateDisputeInput,
  CreateDisputeMessageInput,
  DisputeListQueryInput,
  DisputeStatusUpdateInput,
} from "./dispute.validation.js";

const requireRole = (req: Request) => {
  const role = req.user?.role;
  if (!role) {
    throw new AppError(401, "Unauthorized");
  }
  return role;
};

export const createDispute = async (req: Request, res: Response) => {
  const dispute = await disputeService.create(
    requireUserId(req),
    req.body as CreateDisputeInput,
  );
  res.status(201).json({ dispute });
};

export const listMyDisputes = async (req: Request, res: Response) => {
  const result = await disputeService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as DisputeListQueryInput,
  );
  res.status(200).json(result);
};

export const listBusinessDisputes = async (req: Request, res: Response) => {
  const result = await disputeService.listForBusiness(
    requireUserId(req),
    req.validatedQuery as unknown as DisputeListQueryInput,
  );
  res.status(200).json(result);
};

export const listAllDisputes = async (req: Request, res: Response) => {
  const result = await disputeService.listAll(
    req.validatedQuery as unknown as DisputeListQueryInput,
  );
  res.status(200).json(result);
};

export const getDispute = async (req: Request, res: Response) => {
  const dispute = await disputeService.getById(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "disputeId"),
  );
  res.status(200).json({ dispute });
};

export const updateDisputeStatus = async (req: Request, res: Response) => {
  const dispute = await disputeService.updateStatus(
    requireUserId(req),
    requireParam(req, "disputeId"),
    req.body as DisputeStatusUpdateInput,
  );
  res.status(200).json({ dispute });
};

export const addDisputeMessage = async (req: Request, res: Response) => {
  const message = await disputeService.addMessage(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "disputeId"),
    req.body as CreateDisputeMessageInput,
  );
  res.status(201).json({ message });
};

export const listDisputeMessages = async (req: Request, res: Response) => {
  const messages = await disputeService.listMessages(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "disputeId"),
  );
  res.status(200).json({ messages });
};

export const addDisputeAttachment = async (req: Request, res: Response) => {
  const attachment = await disputeService.addAttachment(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "disputeId"),
    req.body as CreateDisputeAttachmentInput,
  );
  res.status(201).json({ attachment });
};

export const listDisputeAttachments = async (req: Request, res: Response) => {
  const attachments = await disputeService.listAttachments(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "disputeId"),
  );
  res.status(200).json({ attachments });
};
