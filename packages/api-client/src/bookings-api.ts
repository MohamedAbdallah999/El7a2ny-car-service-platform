import type { Booking, PaginatedResult } from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export interface CreateBookingPayload {
  businessId: string;
  branchId: string;
  serviceId: string;
  vehicleId: string;
  scheduledDate: string;
  startTime: string;
  customerNotes?: string;
}

export interface ListBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface UpdateBookingStatusPayload {
  status: string;
  reason?: string;
}

export const createBookingsApi = (client: ApiClient) => ({
  create: (payload: CreateBookingPayload) =>
    client.request<{ booking: Booking }>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listMine: (params: ListBookingsParams = {}) =>
    client.request<PaginatedResult<Booking>>(
      `/bookings/mine${toQueryString(params)}`,
    ),

  getById: (bookingId: string) =>
    client.request<{ booking: Booking }>(`/bookings/${bookingId}`),

  updateStatus: (bookingId: string, payload: UpdateBookingStatusPayload) =>
    client.request<{ booking: Booking }>(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
});

export type BookingsApi = ReturnType<typeof createBookingsApi>;
