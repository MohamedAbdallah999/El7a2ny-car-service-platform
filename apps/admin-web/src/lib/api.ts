import {
  createApiClient,
  createAuthApi,
  createBusinessesApi,
  createDashboardApi,
  createBookingsApi,
  createCatalogApi,
  createOrdersApi,
  createServiceRequestsApi,
  createServicesApi,
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
export const bookingsApi = createBookingsApi(apiClient);
export const catalogApi = createCatalogApi(apiClient);
export const ordersApi = createOrdersApi(apiClient);
export const serviceRequestsApi = createServiceRequestsApi(apiClient);
export const servicesApi = createServicesApi(apiClient);
export const uploadsApi = createUploadsApi(apiClient);
