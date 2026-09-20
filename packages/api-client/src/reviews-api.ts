import type { PaginatedResult } from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export interface BusinessReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  adminReply: string | null;
  createdAt: string;
  customer: { user: { firstName: string; lastName: string } };
}

export interface CreateBusinessReviewPayload {
  businessId: string;
  bookingId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export const createReviewsApi = (client: ApiClient) => ({
  listForBusiness: (businessId: string, params: { page?: number; limit?: number } = {}) =>
    client.request<PaginatedResult<BusinessReview>>(
      `/reviews/business${toQueryString({ businessId, ...params })}`,
    ),

  createBusinessReview: (payload: CreateBusinessReviewPayload) =>
    client.request<{ review: BusinessReview }>("/reviews/business", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
});

export type ReviewsApi = ReturnType<typeof createReviewsApi>;
