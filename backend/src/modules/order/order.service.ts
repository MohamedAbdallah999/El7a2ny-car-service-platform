import {
  buildPaginationMeta,
  generateReferenceNumber,
  normalizePagination,
} from "@car-platform/utils";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import type {
  OrderStatus,
  Prisma,
  UserRole,
} from "../../generated/prisma/client.js";
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

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: ["REFUNDED", "PARTIALLY_REFUNDED"],
  REFUNDED: [],
  PARTIALLY_REFUNDED: ["REFUNDED"],
};

export const canTransitionOrderStatus = (
  current: OrderStatus,
  next: OrderStatus,
): boolean => ALLOWED_TRANSITIONS[current].includes(next);

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

const loadOrderInventory = async (
  tx: Prisma.TransactionClient,
  item: { id: string; productId: string; businessId: string; quantity: number },
) => {
  const inventory = await tx.inventory.findFirst({
    where: {
      productId: item.productId,
      businessId: item.businessId,
      branch: { status: "ACTIVE" },
    },
    orderBy: [{ branch: { isPrimary: "desc" } }, { createdAt: "asc" }],
  });
  if (!inventory) throw new Error("INVENTORY_NOT_FOUND");
  return inventory;
};

// Order.status belongs to the whole order. Checkout therefore keeps each
// order business-scoped, which makes fulfilment, stock allocation, returns,
// and admin authorization consistent for every line item.
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
    if (new Set(cart.items.map((item) => item.product.businessId)).size > 1) {
      throw new AppError(
        400,
        "Place products from different businesses in separate orders",
      );
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
    const where: Prisma.OrderWhereInput = {
      items: { some: { business: { adminId } } },
      ...(query.status ? { status: query.status } : {}),
    };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { include: { user: true } },
          payments: { orderBy: { createdAt: "desc" }, take: 1 },
          items: { where: { business: { adminId } } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    const items = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
      customer: order.customer,
      paymentStatus: order.payments[0]?.status ?? "PENDING",
      products: order.items.map((item) => item.productNameSnapshot).join(", "),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        quantity: item.quantity,
      })),
      total: order.items
        .reduce((sum, item) => sum + Number(item.totalAmount), 0)
        .toFixed(2),
      currency: order.currency,
    }));
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
      const ownsEveryItem = order.items.every(
        (item) => item.businessId && item.business.adminId === adminId,
      );
      if (ownsEveryItem) return order;
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
      role === "CUSTOMER" &&
      !["PENDING", "CONFIRMED"].includes(order.status)
    ) {
      throw new AppError(400, "This order can no longer be cancelled");
    }
    if (!canTransitionOrderStatus(order.status, input.status)) {
      throw new AppError(
        400,
        `Cannot change order status from ${order.status} to ${input.status}`,
      );
    }

    const data: Prisma.OrderUpdateInput = { status: input.status };
    if (input.status === "CANCELLED") {
      data.cancelledAt = new Date();
    }
    if (input.status === "COMPLETED") {
      data.completedAt = new Date();
    }

    try {
      return await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: { items: true },
        });
        if (current.status !== order.status) {
          throw new Error("ORDER_ALREADY_UPDATED");
        }

        if (input.status === "CONFIRMED") {
          for (const item of current.items) {
            const duplicate = await tx.inventoryMovement.findFirst({
              where: {
                referenceType: "ORDER_ITEM",
                referenceId: item.id,
                type: "SALE",
              },
            });
            if (duplicate) throw new Error("ORDER_STOCK_ALREADY_APPLIED");
            const inventory = await loadOrderInventory(tx, item);
            const changed = await tx.inventory.updateMany({
              where: {
                id: inventory.id,
                quantity: { gte: item.quantity },
                availableQuantity: { gte: item.quantity },
              },
              data: {
                quantity: { decrement: item.quantity },
                availableQuantity: { decrement: item.quantity },
              },
            });
            if (changed.count !== 1) throw new Error("INSUFFICIENT_STOCK");
            await tx.inventoryMovement.create({
              data: {
                inventoryId: inventory.id,
                productId: item.productId,
                type: "SALE",
                quantity: -item.quantity,
                previousQuantity: inventory.quantity,
                newQuantity: inventory.quantity - item.quantity,
                referenceType: "ORDER_ITEM",
                referenceId: item.id,
                performedByUserId: userId,
                notes: `Stock allocated for order ${current.orderNumber}`,
              },
            });
          }
        }

        if (
          input.status === "CANCELLED" &&
          ["CONFIRMED", "PROCESSING"].includes(current.status)
        ) {
          for (const item of current.items) {
            const sale = await tx.inventoryMovement.findFirst({
              where: {
                referenceType: "ORDER_ITEM",
                referenceId: item.id,
                type: "SALE",
              },
            });
            if (!sale) throw new Error("ORDER_STOCK_NOT_APPLIED");
            const duplicate = await tx.inventoryMovement.findFirst({
              where: {
                referenceType: "ORDER_ITEM",
                referenceId: item.id,
                type: { in: ["RELEASE", "RETURN"] },
              },
            });
            if (duplicate) throw new Error("ORDER_STOCK_ALREADY_RESTORED");
            const inventory = await tx.inventory.findUniqueOrThrow({
              where: { id: sale.inventoryId },
            });
            const restored = Math.abs(sale.quantity);
            await tx.inventory.update({
              where: { id: inventory.id },
              data: {
                quantity: { increment: restored },
                availableQuantity: { increment: restored },
              },
            });
            await tx.inventoryMovement.create({
              data: {
                inventoryId: inventory.id,
                productId: item.productId,
                type: "RELEASE",
                quantity: restored,
                previousQuantity: inventory.quantity,
                newQuantity: inventory.quantity + restored,
                referenceType: "ORDER_ITEM",
                referenceId: item.id,
                performedByUserId: userId,
                notes: `Stock released after cancelling ${current.orderNumber}`,
              },
            });
          }
        }

        return tx.order.update({
          where: { id: orderId },
          data,
          include: ORDER_INCLUDE,
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "INSUFFICIENT_STOCK") {
          throw new AppError(
            409,
            "There is not enough stock to confirm this order",
          );
        }
        if (error.message === "INVENTORY_NOT_FOUND") {
          throw new AppError(
            409,
            "An order item has no active inventory record",
          );
        }
        if (error.message.startsWith("ORDER_")) {
          throw new AppError(409, "This order's inventory was already updated");
        }
      }
      throw error;
    }
  },

  async processReturn(userId: string, orderId: string) {
    const order = await this.getById(userId, "ADMIN", orderId);
    if (!(["DELIVERED", "COMPLETED"] as OrderStatus[]).includes(order.status)) {
      throw new AppError(
        400,
        "Only delivered or completed orders can be returned",
      );
    }
    try {
      return await prisma.$transaction(async (tx) => {
        const current = await tx.order.findUniqueOrThrow({
          where: { id: orderId },
          include: { items: true },
        });
        if (
          !(["DELIVERED", "COMPLETED"] as OrderStatus[]).includes(
            current.status,
          )
        ) {
          throw new Error("ORDER_ALREADY_RETURNED");
        }
        for (const item of current.items) {
          const sale = await tx.inventoryMovement.findFirst({
            where: {
              referenceType: "ORDER_ITEM",
              referenceId: item.id,
              type: "SALE",
            },
          });
          if (!sale) throw new Error("ORDER_STOCK_NOT_APPLIED");
          const duplicate = await tx.inventoryMovement.findFirst({
            where: {
              referenceType: "ORDER_ITEM",
              referenceId: item.id,
              type: "RETURN",
            },
          });
          if (duplicate) throw new Error("ORDER_ALREADY_RETURNED");
          const inventory = await tx.inventory.findUniqueOrThrow({
            where: { id: sale.inventoryId },
          });
          const returned = Math.abs(sale.quantity);
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              quantity: { increment: returned },
              availableQuantity: { increment: returned },
            },
          });
          await tx.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              productId: item.productId,
              type: "RETURN",
              quantity: returned,
              previousQuantity: inventory.quantity,
              newQuantity: inventory.quantity + returned,
              referenceType: "ORDER_ITEM",
              referenceId: item.id,
              performedByUserId: userId,
              notes: `Returned from order ${current.orderNumber}`,
            },
          });
        }
        return tx.order.update({
          where: { id: orderId },
          data: { status: "REFUNDED" },
          include: ORDER_INCLUDE,
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("ORDER_")) {
        throw new AppError(409, "This order cannot be returned again");
      }
      throw error;
    }
  },

  async createShipment(
    userId: string,
    orderId: string,
    input: CreateShipmentInput,
  ) {
    const adminId = await requireAdminId(userId);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { business: true } } },
    });
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    const ownsEveryItem = order.items.every(
      (item) => item.business.adminId === adminId,
    );
    if (!ownsEveryItem) {
      throw new AppError(403, "You do not fulfil every item on this order");
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
      include: {
        order: { include: { items: { include: { business: true } } } },
      },
    });
    if (!shipment) {
      throw new AppError(404, "Shipment not found");
    }
    const ownsEveryItem = shipment.order.items.every(
      (item) => item.business.adminId === adminId,
    );
    if (!ownsEveryItem) {
      throw new AppError(403, "You do not fulfil every item on this order");
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
