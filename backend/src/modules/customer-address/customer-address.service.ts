import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "./customer-address.validation.js";

const requireCustomerId = async (userId: string): Promise<string> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!customer) {
    throw new AppError(403, "Only customer accounts have addresses");
  }
  return customer.id;
};

const setDefaultAddress = (tx: Prisma.TransactionClient, customerId: string) =>
  tx.customerAddress.updateMany({
    where: { customerId },
    data: { isDefault: false },
  });

export const customerAddressService = {
  async list(userId: string) {
    const customerId = await requireCustomerId(userId);
    return prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  async getOwned(userId: string, addressId: string) {
    const address = await prisma.customerAddress.findUnique({
      where: { id: addressId },
      include: { customer: true },
    });
    if (!address || address.customer.userId !== userId) {
      throw new AppError(404, "Address not found");
    }
    return address;
  },

  async create(userId: string, input: CreateAddressInput) {
    const customerId = await requireCustomerId(userId);
    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await setDefaultAddress(tx, customerId);
      }
      return tx.customerAddress.create({ data: { ...input, customerId } });
    });
  },

  async update(userId: string, addressId: string, input: UpdateAddressInput) {
    const address = await this.getOwned(userId, addressId);
    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await setDefaultAddress(tx, address.customerId);
      }
      return tx.customerAddress.update({ where: { id: addressId }, data: input });
    });
  },

  async remove(userId: string, addressId: string) {
    await this.getOwned(userId, addressId);
    // Order.shippingAddressId is onDelete: SetNull (a placed order keeps its
    // own immutable shippingAddressSnapshot regardless), so deleting an
    // address already used on a past order is always safe.
    await prisma.customerAddress.delete({ where: { id: addressId } });
  },
};
