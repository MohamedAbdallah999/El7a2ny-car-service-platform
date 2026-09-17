import type {
  PaginatedResult,
  Product,
  ProductCategory,
} from "@car-platform/types";
import type { ApiClient } from "./client.js";
import { toQueryString } from "./query.js";

export interface ListProductsParams {
  page?: number;
  limit?: number;
  businessId?: string;
  categoryId?: string;
  brand?: string;
  search?: string;
}

export const createCatalogApi = (client: ApiClient) => ({
  listCategories: () =>
    client.request<{ categories: ProductCategory[] }>(
      "/catalog/categories",
    ),

  list: (params: ListProductsParams = {}) =>
    client.request<PaginatedResult<Product>>(
      `/catalog/products${toQueryString(params)}`,
    ),

  getBySlug: (slug: string) =>
    client.request<{ product: Product }>(
      `/catalog/products/slug/${encodeURIComponent(slug)}`,
    ),

  getById: (productId: string) =>
    client.request<{ product: Product }>(`/catalog/products/${productId}`),
});

export type CatalogApi = ReturnType<typeof createCatalogApi>;
