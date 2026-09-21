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
  phone?: string;
  email?: string;
  addressLine1: string;
  city: string;
  country: string;
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
