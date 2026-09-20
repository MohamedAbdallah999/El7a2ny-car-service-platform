import type {
  BusinessBranchSummary,
  BusinessSummary,
  PaginatedResult,
} from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export interface ListBusinessesParams {
  page?: number;
  limit?: number;
  businessType?: string;
  city?: string;
  search?: string;
}

export const createBusinessesApi = (client: ApiClient) => ({
  list: (params: ListBusinessesParams = {}) =>
    client.request<PaginatedResult<BusinessSummary>>(
      `/businesses${toQueryString(params)}`,
    ),

  getBySlug: (slug: string) =>
    client.request<{ business: BusinessSummary }>(
      `/businesses/slug/${encodeURIComponent(slug)}`,
    ),

  listBranches: (businessId: string) =>
    client.request<{ branches: BusinessBranchSummary[] }>(
      `/businesses/${businessId}/branches`,
    ),
});

export type BusinessesApi = ReturnType<typeof createBusinessesApi>;
