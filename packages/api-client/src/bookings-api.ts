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
export interface CreateBusinessBookingPayload extends CreateBookingPayload {
  customerId: string;
}

export interface ListBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  date?: string;
}

export interface UpdateBookingStatusPayload {
  status: string;
  reason?: string;
}

export interface RescheduleBookingPayload {
  serviceId: string;
  scheduledDate: string;
  startTime: string;
}

export const createBookingsApi = (client: ApiClient) => ({
  create: (payload: CreateBookingPayload) =>
    client.request<{ booking: Booking }>("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createForBusiness: (payload: CreateBusinessBookingPayload) =>
    client.request<{ booking: Booking }>("/bookings/business", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listMine: (params: ListBookingsParams = {}) =>
    client.request<PaginatedResult<Booking>>(
      `/bookings/mine${toQueryString(params)}`,
    ),

  listForBusiness: (params: ListBookingsParams = {}) =>
    client.request<PaginatedResult<Booking>>(
      `/bookings/business${toQueryString(params)}`,
    ),

  getById: (bookingId: string) =>
    client.request<{ booking: Booking }>(`/bookings/${bookingId}`),

  reschedule: (bookingId: string, payload: RescheduleBookingPayload) =>
    client.request<{ booking: Booking }>(`/bookings/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateStatus: (bookingId: string, payload: UpdateBookingStatusPayload) =>
    client.request<{ booking: Booking }>(`/bookings/${bookingId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
});

export type BookingsApi = ReturnType<typeof createBookingsApi>;
