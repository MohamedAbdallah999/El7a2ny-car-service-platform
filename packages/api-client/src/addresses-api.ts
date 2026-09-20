import type { CustomerAddress } from "@car-platform/types";
import type { ApiClient } from "./client.js";

export interface AddressPayload {
  label?: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isDefault?: boolean;
}

export const createAddressesApi = (client: ApiClient) => ({
  list: () => client.request<{ addresses: CustomerAddress[] }>("/addresses"),

  create: (payload: AddressPayload) =>
    client.request<{ address: CustomerAddress }>("/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (addressId: string, payload: Partial<AddressPayload>) =>
    client.request<{ address: CustomerAddress }>(`/addresses/${addressId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (addressId: string) =>
    client.request<void>(`/addresses/${addressId}`, { method: "DELETE" }),
});

export type AddressesApi = ReturnType<typeof createAddressesApi>;
