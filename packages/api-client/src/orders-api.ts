import type { Order, PaginatedResult } from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export interface CheckoutPayload {
  shippingAddressId: string;
  customerNotes?: string;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const createOrdersApi = (client: ApiClient) => ({
  checkout: (payload: CheckoutPayload) =>
    client.request<{ order: Order }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listMine: (params: ListOrdersParams = {}) =>
    client.request<PaginatedResult<Order>>(
      `/orders/mine${toQueryString(params)}`,
    ),

  getById: (orderId: string) =>
    client.request<{ order: Order }>(`/orders/${orderId}`),

  cancel: (orderId: string) =>
    client.request<{ order: Order }>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "CANCELLED" }),
    }),
});

export type OrdersApi = ReturnType<typeof createOrdersApi>;
