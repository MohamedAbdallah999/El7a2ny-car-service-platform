import type { Vehicle, VehicleMake, VehicleModel } from "@car-platform/types";
import type { ApiClient } from "./client.js";

export interface CreateVehiclePayload {
  makeId: string;
  modelId: string;
  year: number;
  trim?: string;
  color?: string;
  licensePlate?: string;
  vin?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  nickname?: string;
  imageUrl?: string;
  isPrimary?: boolean;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;

export const createVehiclesApi = (client: ApiClient) => ({
  listMakes: () => client.request<{ makes: VehicleMake[] }>("/vehicles/makes"),

  listModels: (makeId: string) =>
    client.request<{ models: VehicleModel[] }>(
      `/vehicles/makes/${makeId}/models`,
    ),

  listMine: () => client.request<{ vehicles: Vehicle[] }>("/vehicles"),

  getById: (vehicleId: string) =>
    client.request<{ vehicle: Vehicle }>(`/vehicles/${vehicleId}`),

  create: (payload: CreateVehiclePayload) =>
    client.request<{ vehicle: Vehicle }>("/vehicles", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (vehicleId: string, payload: UpdateVehiclePayload) =>
    client.request<{ vehicle: Vehicle }>(`/vehicles/${vehicleId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  remove: (vehicleId: string) =>
    client.request<void>(`/vehicles/${vehicleId}`, { method: "DELETE" }),
});

export type VehiclesApi = ReturnType<typeof createVehiclesApi>;
