import type { Request, Response } from "express";
import { requireParam, requireUserId } from "../../utils/request.js";
import { platformAdminService } from "./platform-admin.service.js";
import type {
  AuditLogListQueryInput,
  UpsertSettingInput,
} from "./platform-admin.validation.js";

export const listAuditLogs = async (req: Request, res: Response) => {
  const result = await platformAdminService.listAuditLogs(
    req.validatedQuery as unknown as AuditLogListQueryInput,
  );
  res.status(200).json(result);
};

export const listSettings = async (_req: Request, res: Response) => {
  const settings = await platformAdminService.listSettings();
  res.status(200).json({ settings });
};

export const getSetting = async (req: Request, res: Response) => {
  const setting = await platformAdminService.getSetting(requireParam(req, "key"));
  res.status(200).json({ setting });
};

export const upsertSetting = async (req: Request, res: Response) => {
  const setting = await platformAdminService.upsertSetting(
    requireParam(req, "key"),
    requireUserId(req),
    req.body as UpsertSettingInput,
  );
  res.status(200).json({ setting });
};
