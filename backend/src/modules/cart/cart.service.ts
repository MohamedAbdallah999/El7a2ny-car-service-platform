import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../config/database.js";
import { Prisma } from "../../generated/prisma/client.js";
import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "./cart.validation.js";

const CART_ITEMS_INCLUDE = {
  items: { include: { product: true }, orderBy: { createdAt: "asc" as const } },
};

const requireCustomerId = async (userId: string): Promise<string> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!customer) {
    throw new AppError(403, "Only customer accounts have a cart");
  }
  return customer.id;
};

// One-active-cart-per-customer is enforced by a partial unique index
// (customer_id) WHERE status = 'ACTIVE', added in a follow-up raw-SQL
// migration because Prisma's schema syntax can't express partial indexes —
// so there's no `@@unique` for the generated client to expose as an
// `upsert` target, and this has to be a plain find-then-create instead,
// with the DB constraint as the race-condition backstop.
const getOrCreateActiveCart = async (customerId: string) => {
  const existing = await prisma.cart.findFirst({
    where: { customerId, status: "ACTIVE" },
    include: CART_ITEMS_INCLUDE,
  });
  if (existing) {
    return existing;
  }

  try {
    return await prisma.cart.create({
      data: { customerId, status: "ACTIVE" },
      include: CART_ITEMS_INCLUDE,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const cart = await prisma.cart.findFirst({
        where: { customerId, status: "ACTIVE" },
        include: CART_ITEMS_INCLUDE,
      });
      if (cart) {
        return cart;
      }
    }
    throw error;
  }
};

const summarize = (cart: { items: { quantity: number; unitPrice: unknown }[] }) => {
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, itemCount };
};

export const cartService = {
  async getMine(userId: string) {
    const customerId = await requireCustomerId(userId);
    const cart = await getOrCreateActiveCart(customerId);
    return { cart, ...summarize(cart) };
  },

  async addItem(userId: string, input: AddCartItemInput) {
    const customerId = await requireCustomerId(userId);
    const product = await prisma.product.findFirst({
      where: { id: input.productId, deletedAt: null },
    });
    if (!product || product.status !== "ACTIVE") {
      throw new AppError(400, "Product is not available");
    }

    const cart = await getOrCreateActiveCart(customerId);
    const existing = cart.items.find((item) => item.productId === input.productId);

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + input.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: product.price,
        },
      });
    }

    return this.getMine(userId);
  },

  async updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
    const customerId = await requireCustomerId(userId);
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item || item.cart.customerId !== customerId) {
      throw new AppError(404, "Cart item not found");
    }
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: input.quantity },
    });
    return this.getMine(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const customerId = await requireCustomerId(userId);
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });
    if (!item || item.cart.customerId !== customerId) {
      throw new AppError(404, "Cart item not found");
    }
    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getMine(userId);
  },

  async clear(userId: string) {
    const customerId = await requireCustomerId(userId);
    const cart = await getOrCreateActiveCart(customerId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getMine(userId);
  },
};
