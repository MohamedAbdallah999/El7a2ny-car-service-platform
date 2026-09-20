import type { Request, Response } from "express";
import { AppError } from "../../errors/app-error.js";
import { requireParam, requireUserId } from "../../utils/request.js";
import { serviceRequestService } from "./service-request.service.js";
import type {
  CreateAttachmentInput,
  CreateMessageInput,
  CreateServiceRequestInput,
  ServiceRequestListQueryInput,
  ServiceRequestStatusUpdateInput,
} from "./service-request.validation.js";

const requireRole = (req: Request) => {
  const role = req.user?.role;
  if (!role) {
    throw new AppError(401, "Unauthorized");
  }
  return role;
};

export const createServiceRequest = async (req: Request, res: Response) => {
  const request = await serviceRequestService.create(
    requireUserId(req),
    req.body as CreateServiceRequestInput,
  );
  res.status(201).json({ request });
};

export const listMyServiceRequests = async (req: Request, res: Response) => {
  const result = await serviceRequestService.listMine(
    requireUserId(req),
    req.validatedQuery as unknown as ServiceRequestListQueryInput,
  );
  res.status(200).json(result);
};

export const listBusinessServiceRequests = async (
  req: Request,
  res: Response,
) => {
  const result = await serviceRequestService.listForBusiness(
    requireUserId(req),
    req.validatedQuery as unknown as ServiceRequestListQueryInput,
  );
  res.status(200).json(result);
};

export const getServiceRequest = async (req: Request, res: Response) => {
  const request = await serviceRequestService.getById(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "requestId"),
  );
  res.status(200).json({ request });
};

export const updateServiceRequestStatus = async (
  req: Request,
  res: Response,
) => {
  const request = await serviceRequestService.updateStatus(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "requestId"),
    req.body as ServiceRequestStatusUpdateInput,
  );
  res.status(200).json({ request });
};

export const addServiceRequestMessage = async (req: Request, res: Response) => {
  const message = await serviceRequestService.addMessage(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "requestId"),
    req.body as CreateMessageInput,
  );
  res.status(201).json({ message });
};

export const listServiceRequestMessages = async (
  req: Request,
  res: Response,
) => {
  const messages = await serviceRequestService.listMessages(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "requestId"),
  );
  res.status(200).json({ messages });
};

export const addServiceRequestAttachment = async (
  req: Request,
  res: Response,
) => {
  const attachment = await serviceRequestService.addAttachment(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "requestId"),
    req.body as CreateAttachmentInput,
  );
  res.status(201).json({ attachment });
};

export const listServiceRequestAttachments = async (
  req: Request,
  res: Response,
) => {
  const attachments = await serviceRequestService.listAttachments(
    requireUserId(req),
    requireRole(req),
    requireParam(req, "requestId"),
  );
  res.status(200).json({ attachments });
};
