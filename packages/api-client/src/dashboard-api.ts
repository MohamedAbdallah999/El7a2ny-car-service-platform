import type {
  AdminCustomerDetails,
  AdminCustomerSummary,
  AdminDashboardResponse,
} from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export const createDashboardApi = (client: ApiClient) => ({
  getAdminOverview: () =>
    client.request<AdminDashboardResponse>("/dashboard/admin"),
  listAdminCustomers: (businessId?: string) =>
    client.request<{ customers: AdminCustomerSummary[] }>(
      `/dashboard/admin/customers${toQueryString({ businessId })}`,
    ),
  getAdminCustomer: (customerId: string, businessId?: string) =>
    client.request<{ customer: AdminCustomerDetails }>(
      `/dashboard/admin/customers/${encodeURIComponent(customerId)}${toQueryString({ businessId })}`,
    ),
});

export type DashboardApi = ReturnType<typeof createDashboardApi>;
