import type {
  PaginatedResult,
  Product,
  ProductCategory,
  ProductImage,
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
export interface ProductPayload {
  businessId: string;
  categoryId: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  price: number;
  costPrice?: number;
  currency?: string;
  inventory?: {
    branchId: string;
    quantity: number;
    lowStockThreshold: number;
    reorderQuantity: number;
  };
}
export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  product: Product;
}

export const createCatalogApi = (client: ApiClient) => ({
  listCategories: () =>
    client.request<{ categories: ProductCategory[] }>("/catalog/categories"),

  list: (params: ListProductsParams = {}) =>
    client.request<PaginatedResult<Product>>(
      `/catalog/products${toQueryString(params)}`,
    ),

  listForBusiness: (params: Omit<ListProductsParams, "businessId"> = {}) =>
    client.request<PaginatedResult<Product>>(
      `/catalog/products/business${toQueryString(params)}`,
    ),

  getBySlug: (slug: string) =>
    client.request<{ product: Product }>(
      `/catalog/products/slug/${encodeURIComponent(slug)}`,
    ),

  getById: (productId: string) =>
    client.request<{ product: Product }>(`/catalog/products/${productId}`),

  create: (payload: ProductPayload) =>
    client.request<{ product: Product }>("/catalog/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (
    productId: string,
    payload: Partial<Omit<ProductPayload, "businessId" | "inventory">> & {
      status?: string;
    },
  ) =>
    client.request<{ product: Product }>(`/catalog/products/${productId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (productId: string) =>
    client.request<void>(`/catalog/products/${productId}`, {
      method: "DELETE",
    }),
  addImage: (
    productId: string,
    payload: {
      imageUrl: string;
      altText?: string;
      isPrimary?: boolean;
      sortOrder?: number;
    },
  ) =>
    client.request<{ image: ProductImage }>(
      `/catalog/products/${productId}/images`,
      { method: "POST", body: JSON.stringify(payload) },
    ),
  listInventory: (businessId: string) =>
    client.request<PaginatedResult<InventoryItem>>(
      `/catalog/inventory${toQueryString({ businessId, limit: 100 })}`,
    ),
  adjustInventory: (
    inventoryId: string,
    payload: { type: string; quantity: number; notes?: string },
  ) =>
    client.request<{ inventory: InventoryItem }>(
      `/catalog/inventory/${inventoryId}/adjust`,
      { method: "POST", body: JSON.stringify(payload) },
    ),
});

export type CatalogApi = ReturnType<typeof createCatalogApi>;
