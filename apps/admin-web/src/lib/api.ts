import {
  createApiClient,
  createAuthApi,
  createBusinessesApi,
  createDashboardApi,
  createServiceRequestsApi,
  createUploadsApi,
} from "@car-platform/api-client";
import { adminTokenStorage } from "./token-storage";

const baseUrl =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const apiClient = createApiClient({
  baseUrl,
  getAccessToken: () => adminTokenStorage.getToken(),
});

export const authApi = createAuthApi(apiClient);
export const businessesApi = createBusinessesApi(apiClient);
export const dashboardApi = createDashboardApi(apiClient);
export const serviceRequestsApi = createServiceRequestsApi(apiClient);
export const uploadsApi = createUploadsApi(apiClient);
