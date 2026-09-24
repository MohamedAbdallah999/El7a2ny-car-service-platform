import type {
  PaginatedResult,
  ServiceRequestSummary,
} from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export interface CreateServiceRequestPayload {
  vehicleId: string;
  businessId?: string;
  branchId?: string;
  serviceId?: string;
  title: string;
  description?: string;
  priority?: string;
}

export interface ListServiceRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const createServiceRequestsApi = (client: ApiClient) => ({
  create: (payload: CreateServiceRequestPayload) =>
    client.request<{ request: ServiceRequestSummary }>("/service-requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listMine: (params: ListServiceRequestsParams = {}) =>
    client.request<PaginatedResult<ServiceRequestSummary>>(
      `/service-requests/mine${toQueryString(params)}`,
    ),

  listForBusiness: (params: ListServiceRequestsParams = {}) =>
    client.request<PaginatedResult<ServiceRequestSummary>>(
      `/service-requests/business${toQueryString(params)}`,
    ),

  getById: (requestId: string) =>
    client.request<{ request: ServiceRequestSummary }>(
      `/service-requests/${requestId}`,
    ),

  updateStatus: (
    requestId: string,
    status: string,
    amounts: { estimatedPrice?: number; finalPrice?: number } = {},
  ) =>
    client.request<{ request: ServiceRequestSummary }>(
      `/service-requests/${requestId}/status`,
      { method: "PATCH", body: JSON.stringify({ status, ...amounts }) },
    ),
  accept: (requestId: string) =>
    client.request<{ request: ServiceRequestSummary }>(
      `/service-requests/${requestId}/accept`,
      { method: "POST" },
    ),
  update: (
    requestId: string,
    payload: { title?: string; description?: string | null; priority?: string },
  ) =>
    client.request<{ request: ServiceRequestSummary }>(
      `/service-requests/${requestId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),
  addMessage: (requestId: string, message: string) =>
    client.request<{ message: unknown }>(
      `/service-requests/${requestId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      },
    ),
});

export type ServiceRequestsApi = ReturnType<typeof createServiceRequestsApi>;
