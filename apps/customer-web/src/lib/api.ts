import {
  createAddressesApi,
  createApiClient,
  createAuthApi,
  createBookingsApi,
  createBusinessesApi,
  createCartApi,
  createCatalogApi,
  createOrdersApi,
  createReviewsApi,
  createServiceRequestsApi,
  createServicesApi,
  createVehiclesApi,
} from "@car-platform/api-client";
import { localStorageTokenStorage } from "./token-storage";

// Vite exposes only VITE_-prefixed env vars to client code; see
// apps/customer-web/.env.example for the local-dev default.
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export const apiClient = createApiClient({
  baseUrl,
  getAccessToken: () => localStorageTokenStorage.getToken(),
});

export const authApi = createAuthApi(apiClient);
export const businessesApi = createBusinessesApi(apiClient);
export const vehiclesApi = createVehiclesApi(apiClient);
export const servicesApi = createServicesApi(apiClient);
export const bookingsApi = createBookingsApi(apiClient);
export const serviceRequestsApi = createServiceRequestsApi(apiClient);
export const catalogApi = createCatalogApi(apiClient);
export const cartApi = createCartApi(apiClient);
export const ordersApi = createOrdersApi(apiClient);
export const addressesApi = createAddressesApi(apiClient);
export const reviewsApi = createReviewsApi(apiClient);
