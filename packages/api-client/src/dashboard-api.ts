import type { AdminDashboardResponse } from "@car-platform/types";
import type { ApiClient } from "./client.js";

export const createDashboardApi = (client: ApiClient) => ({
  getAdminOverview: () =>
    client.request<AdminDashboardResponse>("/dashboard/admin"),
});

export type DashboardApi = ReturnType<typeof createDashboardApi>;
