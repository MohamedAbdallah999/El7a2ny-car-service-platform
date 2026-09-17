import type {
  PaginatedResult,
  ServiceCategory,
  ServiceSummary,
} from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export interface ListServicesParams {
  page?: number;
  limit?: number;
  businessId?: string;
  branchId?: string;
  categoryId?: string;
  search?: string;
}

export const createServicesApi = (client: ApiClient) => ({
  listCategories: () =>
    client.request<{ categories: ServiceCategory[] }>("/services/categories"),

  list: (params: ListServicesParams = {}) =>
    client.request<PaginatedResult<ServiceSummary>>(
      `/services${toQueryString(params)}`,
    ),

  getById: (serviceId: string) =>
    client.request<{ service: ServiceSummary }>(`/services/${serviceId}`),
});

export type ServicesApi = ReturnType<typeof createServicesApi>;
