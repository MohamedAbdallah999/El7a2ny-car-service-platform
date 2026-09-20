import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";

export const vehicleRepository = {
  findCustomerIdByUserId(userId: string) {
    return prisma.customer
      .findUnique({ where: { userId }, select: { id: true } })
      .then((customer) => customer?.id ?? null);
  },

  listMakes(activeOnly: boolean) {
    return prisma.vehicleMake.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
    });
  },

  findMakeById(id: string) {
    return prisma.vehicleMake.findUnique({ where: { id } });
  },

  createMake(data: Prisma.VehicleMakeCreateInput) {
    return prisma.vehicleMake.create({ data });
  },

  updateMake(id: string, data: Prisma.VehicleMakeUpdateInput) {
    return prisma.vehicleMake.update({ where: { id }, data });
  },

  listModels(makeId: string, activeOnly: boolean) {
    return prisma.vehicleModel.findMany({
      where: { makeId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { name: "asc" },
    });
  },

  findModelById(id: string) {
    return prisma.vehicleModel.findUnique({ where: { id } });
  },

  createModel(makeId: string, data: Prisma.VehicleModelCreateWithoutMakeInput) {
    return prisma.vehicleModel.create({ data: { ...data, make: { connect: { id: makeId } } } });
  },

  updateModel(id: string, data: Prisma.VehicleModelUpdateInput) {
    return prisma.vehicleModel.update({ where: { id }, data });
  },

  listByCustomer(customerId: string) {
    return prisma.vehicle.findMany({
      where: { customerId },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      include: { make: true, model: true },
    });
  },

  findById(id: string) {
    return prisma.vehicle.findUnique({
      where: { id },
      include: { make: true, model: true, customer: true },
    });
  },

  create(
    customerId: string,
    data: Omit<Prisma.VehicleUncheckedCreateInput, "customerId">,
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary) {
        await tx.vehicle.updateMany({
          where: { customerId },
          data: { isPrimary: false },
        });
      }
      return tx.vehicle.create({ data: { ...data, customerId } });
    });
  },

  async update(
    id: string,
    customerId: string,
    data: Prisma.VehicleUpdateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.isPrimary === true) {
        await tx.vehicle.updateMany({
          where: { customerId, id: { not: id } },
          data: { isPrimary: false },
        });
      }
      return tx.vehicle.update({ where: { id }, data });
    });
  },

  delete(id: string) {
    return prisma.vehicle.delete({ where: { id } });
  },
};
