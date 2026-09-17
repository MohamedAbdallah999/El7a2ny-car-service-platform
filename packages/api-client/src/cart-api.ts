import type { CartSummary } from "@car-platform/types";
import type { ApiClient } from "./client.js";

export const createCartApi = (client: ApiClient) => ({
  get: () => client.request<CartSummary>("/cart"),

  addItem: (productId: string, quantity: number) =>
    client.request<CartSummary>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    }),

  updateItem: (itemId: string, quantity: number) =>
    client.request<CartSummary>(`/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId: string) =>
    client.request<CartSummary>(`/cart/items/${itemId}`, {
      method: "DELETE",
    }),

  clear: () => client.request<CartSummary>("/cart", { method: "DELETE" }),
});

export type CartApi = ReturnType<typeof createCartApi>;
