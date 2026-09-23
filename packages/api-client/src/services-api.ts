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

export interface CreateServicePayload {
  businessId: string;
  branchId?: string;
  categoryId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  basePrice: number;
  currency?: string;
  isOnlineBooking?: boolean;
}

export interface UpdateServicePayload extends Omit<
  Partial<CreateServicePayload>,
  "businessId"
> {
  isActive?: boolean;
}

export const createServicesApi = (client: ApiClient) => ({
  listCategories: () =>
    client.request<{ categories: ServiceCategory[] }>("/services/categories"),

  list: (params: ListServicesParams = {}) =>
    client.request<PaginatedResult<ServiceSummary>>(
      `/services${toQueryString(params)}`,
    ),

  listForBusiness: (params: Omit<ListServicesParams, "businessId"> = {}) =>
    client.request<PaginatedResult<ServiceSummary>>(
      `/services/business${toQueryString(params)}`,
    ),

  getById: (serviceId: string) =>
    client.request<{ service: ServiceSummary }>(`/services/${serviceId}`),

  create: (payload: CreateServicePayload) =>
    client.request<{ service: ServiceSummary }>("/services", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (serviceId: string, payload: UpdateServicePayload) =>
    client.request<{ service: ServiceSummary }>(`/services/${serviceId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
});

export type ServicesApi = ReturnType<typeof createServicesApi>;
