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

export interface CreateBusinessPayload {
  name: string;
  businessType: string;
  email?: string;
  phone?: string;
  onboardingServices?: string[];
}

export interface CreateBranchPayload {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isPrimary?: boolean;
}

export interface BusinessHoursPayload {
  hours: Array<{
    dayOfWeek: number;
    openingTime?: string;
    closingTime?: string;
    isClosed: boolean;
  }>;
}

export interface CreateBusinessDocumentPayload {
  documentType:
    | "BUSINESS_LICENSE"
    | "TAX_DOCUMENT"
    | "OWNER_ID"
    | "COMMERCIAL_REGISTRATION"
    | "OTHER";
  fileUrl: string;
}

export interface UpdateBusinessPayload {
  name?: string;
  description?: string | null;
  businessType?: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
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

  listMine: (params: ListBusinessesParams = {}) =>
    client.request<PaginatedResult<BusinessSummary>>(
      `/businesses/mine${toQueryString(params)}`,
    ),

  getById: (businessId: string) =>
    client.request<{ business: BusinessSummary }>(`/businesses/${businessId}`),

  update: (businessId: string, payload: UpdateBusinessPayload) =>
    client.request<{ business: BusinessSummary }>(`/businesses/${businessId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  create: (payload: CreateBusinessPayload) =>
    client.request<{ business: BusinessSummary }>("/businesses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createBranch: (businessId: string, payload: CreateBranchPayload) =>
    client.request<{ branch: BusinessBranchSummary }>(
      `/businesses/${businessId}/branches`,
      { method: "POST", body: JSON.stringify(payload) },
    ),
  updateBranch: (
    businessId: string,
    branchId: string,
    payload: Partial<CreateBranchPayload> & { status?: string },
  ) =>
    client.request<{ branch: BusinessBranchSummary }>(
      `/businesses/${businessId}/branches/${branchId}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    ),

  setBranchHours: (
    businessId: string,
    branchId: string,
    payload: BusinessHoursPayload,
  ) =>
    client.request<{ hours: unknown[] }>(
      `/businesses/${businessId}/branches/${branchId}/hours`,
      { method: "PUT", body: JSON.stringify(payload) },
    ),

  addDocument: (businessId: string, payload: CreateBusinessDocumentPayload) =>
    client.request<{ document: unknown }>(
      `/businesses/${businessId}/documents`,
      { method: "POST", body: JSON.stringify(payload) },
    ),
});

export type BusinessesApi = ReturnType<typeof createBusinessesApi>;
