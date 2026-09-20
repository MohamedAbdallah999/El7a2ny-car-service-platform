import { AppError } from "../../errors/app-error.js";
import { Prisma } from "../../generated/prisma/client.js";
import { vehicleRepository } from "./vehicle.repository.js";
import type {
  CreateMakeInput,
  CreateModelInput,
  CreateVehicleInput,
  UpdateMakeInput,
  UpdateModelInput,
  UpdateVehicleInput,
} from "./vehicle.validation.js";

const requireCustomerId = async (userId: string): Promise<string> => {
  const customerId = await vehicleRepository.findCustomerIdByUserId(userId);
  if (!customerId) {
    throw new AppError(403, "Only customer accounts have vehicles");
  }
  return customerId;
};

const isForeignKeyViolation = (error: unknown): boolean =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2003";

export const vehicleService = {
  listMakes(includeInactive: boolean) {
    return vehicleRepository.listMakes(!includeInactive);
  },

  async createMake(input: CreateMakeInput) {
    try {
      return await vehicleRepository.createMake(input);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(409, "A vehicle make with this name already exists");
      }
      throw error;
    }
  },

  async updateMake(id: string, input: UpdateMakeInput) {
    const make = await vehicleRepository.findMakeById(id);
    if (!make) {
      throw new AppError(404, "Vehicle make not found");
    }
    return vehicleRepository.updateMake(id, input);
  },

  async listModels(makeId: string, includeInactive: boolean) {
    const make = await vehicleRepository.findMakeById(makeId);
    if (!make) {
      throw new AppError(404, "Vehicle make not found");
    }
    return vehicleRepository.listModels(makeId, !includeInactive);
  },

  async createModel(makeId: string, input: CreateModelInput) {
    const make = await vehicleRepository.findMakeById(makeId);
    if (!make) {
      throw new AppError(404, "Vehicle make not found");
    }
    try {
      return await vehicleRepository.createModel(makeId, input);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError(
          409,
          "A model with this name already exists for this make",
        );
      }
      throw error;
    }
  },

  async updateModel(id: string, input: UpdateModelInput) {
    const model = await vehicleRepository.findModelById(id);
    if (!model) {
      throw new AppError(404, "Vehicle model not found");
    }
    return vehicleRepository.updateModel(id, input);
  },

  async listMine(userId: string) {
    const customerId = await requireCustomerId(userId);
    return vehicleRepository.listByCustomer(customerId);
  },

  async getOwned(userId: string, vehicleId: string) {
    const vehicle = await vehicleRepository.findById(vehicleId);
    if (!vehicle || vehicle.customer.userId !== userId) {
      throw new AppError(404, "Vehicle not found");
    }
    return vehicle;
  },

  async create(userId: string, input: CreateVehicleInput) {
    const customerId = await requireCustomerId(userId);
    const [make, model] = await Promise.all([
      vehicleRepository.findMakeById(input.makeId),
      vehicleRepository.findModelById(input.modelId),
    ]);
    if (!make) {
      throw new AppError(400, "Unknown vehicle make");
    }
    if (!model || model.makeId !== input.makeId) {
      throw new AppError(400, "Unknown vehicle model for this make");
    }
    return vehicleRepository.create(customerId, input);
  },

  async update(userId: string, vehicleId: string, input: UpdateVehicleInput) {
    const vehicle = await this.getOwned(userId, vehicleId);
    return vehicleRepository.update(vehicleId, vehicle.customerId, input);
  },

  async remove(userId: string, vehicleId: string) {
    const vehicle = await this.getOwned(userId, vehicleId);
    try {
      await vehicleRepository.delete(vehicle.id);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new AppError(
          409,
          "This vehicle has existing bookings or service requests and cannot be deleted",
        );
      }
      throw error;
    }
  },
};
