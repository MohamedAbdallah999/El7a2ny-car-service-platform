import {
  buildPaginationMeta,
  generateReferenceNumber,
  normalizePagination,
} from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type { Prisma, UserRole } from "../../generated/prisma/client.js";
import type {
  CheckoutInput,
  CreateShipmentInput,
  OrderListQueryInput,
  OrderStatusUpdateInput,
  ShipmentStatusUpdateInput,
} from "./order.validation.js";

const requireCustomerId = async (userId: string): Promise<string> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!customer) {
    throw new AppError(403, "Only customer accounts can place orders");
  }
  return customer.id;
};

const requireAdminId = async (userId: string): Promise<string> => {
  const admin = await prisma.admin.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!admin) {
    throw new AppError(403, "Only admin accounts manage orders");
  }
  return admin.id;
};

const ORDER_INCLUDE = {
  items: { include: { product: true, business: true } },
  shipments: true,
  shippingAddress: true,
} satisfies Prisma.OrderInclude;

const MAX_NUMBER_ATTEMPTS = 5;

const generateUniqueOrderNumber = async (): Promise<string> => {
  for (let attempt = 0; attempt < MAX_NUMBER_ATTEMPTS; attempt += 1) {
    const candidate = generateReferenceNumber("ORD");
    const exists = await prisma.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!exists) {
      return candidate;
    }
  }
  throw new AppError(500, "Could not generate a unique order number");
};

// Order.status is a single field on the whole order even though a cart can
// mix products from several businesses (each OrderItem carries its own
// businessId). Splitting fulfillment status per-business would need a
// schema change that's out of scope here, so for now any admin who owns at
// least one line item may progress the order's overall status — an
// accepted MVP simplification, not a hidden bug.
export const orderService = {
  async checkout(userId: string, input: CheckoutInput) {
    const customerId = await requireCustomerId(userId);

    const address = await prisma.customerAddress.findUnique({
      where: { id: input.shippingAddressId },
    });
    if (!address || address.customerId !== customerId) {
      throw new AppError(400, "Shipping address not found");
    }

    const cart = await prisma.cart.findFirst({
      where: { customerId, status: "ACTIVE" },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      throw new AppError(400, "Cart is empty");
    }

    for (const item of cart.items) {
      if (item.product.status !== "ACTIVE" || item.product.deletedAt) {
        throw new AppError(
          400,
          `"${item.product.name}" is no longer available`,
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );
    const orderNumber = await generateUniqueOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          shippingAddressId: address.id,
          shippingAddressSnapshot: {
            recipientName: address.recipientName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            country: address.country,
            postalCode: address.postalCode,
          },
          status: "PENDING",
          subtotal,
          discountAmount: 0,
          shippingAmount: 0,
          taxAmount: 0,
          totalAmount: subtotal,
          customerNotes: input.customerNotes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              businessId: item.product.businessId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discountAmount: 0,
              totalAmount: Number(item.unitPrice) * item.quantity,
              productNameSnapshot: item.product.name,
              skuSnapshot: item.product.sku,
            })),
          },
        },
        include: ORDER_INCLUDE,
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { status: "CONVERTED" },
      });

      return created;
    });

    return order;
  },

  async listMine(userId: string, query: OrderListQueryInput) {
    const customerId = await requireCustomerId(userId);
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.OrderWhereInput = {
      customerId,
      ...(query.status ? { status: query.status } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: ORDER_INCLUDE,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listForBusiness(userId: string, query: OrderListQueryInput) {
    const adminId = await requireAdminId(userId);
    const { page, limit, skip, take } = normalizePagination(query);
    const where: Prisma.OrderItemWhereInput = {
      business: { adminId },
      ...(query.status ? { order: { status: query.status } } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.orderItem.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          order: { include: { customer: { include: { user: true } } } },
          product: true,
        },
      }),
      prisma.orderItem.count({ where }),
    ]);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(userId: string, role: UserRole, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        ...ORDER_INCLUDE,
        customer: true,
      },
    });
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    if (role === "SUPER_ADMIN") return order;
    if (role === "CUSTOMER" && order.customer.userId === userId) return order;
    if (role === "ADMIN") {
      const adminId = await requireAdminId(userId);
      const ownsItem = order.items.some((item) => item.businessId && item.business.adminId === adminId);
      if (ownsItem) return order;
    }
    throw new AppError(403, "You cannot view this order");
  },

  async updateStatus(
    userId: string,
    role: UserRole,
    orderId: string,
    input: OrderStatusUpdateInput,
  ) {
    const order = await this.getById(userId, role, orderId);

    if (role === "CUSTOMER" && input.status !== "CANCELLED") {
      throw new AppError(403, "Customers may only cancel an order");
    }
    if (
      input.status === "CANCELLED" &&
      !["PENDING", "CONFIRMED"].includes(order.status)
    ) {
      throw new AppError(400, "This order can no longer be cancelled");
    }

    const data: Prisma.OrderUpdateInput = { status: input.status };
    if (input.status === "CANCELLED") {
      data.cancelledAt = new Date();
    }
    if (input.status === "COMPLETED") {
      data.completedAt = new Date();
    }

    return prisma.order.update({
      where: { id: orderId },
      data,
      include: ORDER_INCLUDE,
    });
  },

  async createShipment(userId: string, orderId: string, input: CreateShipmentInput) {
    const adminId = await requireAdminId(userId);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { business: true } } },
    });
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    const ownsItem = order.items.some((item) => item.business.adminId === adminId);
    if (!ownsItem) {
      throw new AppError(403, "You do not fulfil any items on this order");
    }
    return prisma.shipment.create({ data: { ...input, orderId } });
  },

  async updateShipmentStatus(
    userId: string,
    shipmentId: string,
    input: ShipmentStatusUpdateInput,
  ) {
    const adminId = await requireAdminId(userId);
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { order: { include: { items: { include: { business: true } } } } },
    });
    if (!shipment) {
      throw new AppError(404, "Shipment not found");
    }
    const ownsItem = shipment.order.items.some(
      (item) => item.business.adminId === adminId,
    );
    if (!ownsItem) {
      throw new AppError(403, "You do not fulfil any items on this order");
    }

    const data: Prisma.ShipmentUpdateInput = { status: input.status };
    if (input.status === "SHIPPED" && !shipment.shippedAt) {
      data.shippedAt = new Date();
    }
    if (input.status === "DELIVERED") {
      data.deliveredAt = new Date();
    }

    return prisma.shipment.update({ where: { id: shipmentId }, data });
  },
};
