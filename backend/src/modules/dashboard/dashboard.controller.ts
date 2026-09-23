import type { Request, Response } from "express";
import { requireUserId } from "../../utils/request.js";
import { dashboardService } from "./dashboard.service.js";

export const getAdminDashboard = async (req: Request, res: Response) => {
  const dashboard = await dashboardService.getAdminOverview(requireUserId(req));
  res.status(200).json(dashboard);
};

export const getAdminCustomers = async (req: Request, res: Response) => {
  const customers = await dashboardService.getAdminCustomers(
    requireUserId(req),
    req.validatedQuery?.businessId as string | undefined,
  );
  res.status(200).json({ customers });
};

export const getAdminCustomer = async (req: Request, res: Response) => {
  const customer = await dashboardService.getAdminCustomer(
    requireUserId(req),
    req.params.customerId as string,
    req.validatedQuery?.businessId as string | undefined,
  );
  res.status(200).json({ customer });
};
