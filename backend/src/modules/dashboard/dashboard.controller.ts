import type { Request, Response } from "express";
import { requireUserId } from "../../utils/request.js";
import { dashboardService } from "./dashboard.service.js";

export const getAdminDashboard = async (req: Request, res: Response) => {
  const dashboard = await dashboardService.getAdminOverview(requireUserId(req));
  res.status(200).json(dashboard);
};
