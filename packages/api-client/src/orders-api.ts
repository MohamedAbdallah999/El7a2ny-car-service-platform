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
export interface BusinessOrderLine {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  paymentStatus: string;
  products: string;
  total: string;
  currency: string;
  customer: { user: { firstName: string; lastName: string } };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
  }>;
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
  listForBusiness: (params: ListOrdersParams = {}) =>
    client.request<PaginatedResult<BusinessOrderLine>>(
      `/orders/business${toQueryString(params)}`,
    ),

  getById: (orderId: string) =>
    client.request<{ order: Order }>(`/orders/${orderId}`),

  cancel: (orderId: string) =>
    client.request<{ order: Order }>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "CANCELLED" }),
    }),
  updateStatus: (orderId: string, status: string) =>
    client.request<{ order: Order }>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  processReturn: (orderId: string) =>
    client.request<{ order: Order }>(`/orders/${orderId}/return`, {
      method: "POST",
    }),
});

export type OrdersApi = ReturnType<typeof createOrdersApi>;
