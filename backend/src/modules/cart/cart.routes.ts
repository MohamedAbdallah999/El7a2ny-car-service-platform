import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "./cart.controller.js";
import { addCartItemSchema, updateCartItemSchema } from "./cart.validation.js";

const router = Router();

router.use(authenticate, authorize(UserRole.CUSTOMER));

router.get("/", getCart);
router.post(
  "/items",
  validateBody(addCartItemSchema, "Invalid cart item data", true),
  addCartItem,
);
router.patch(
  "/items/:itemId",
  validateBody(updateCartItemSchema, "Invalid cart item data", true),
  updateCartItem,
);
router.delete("/items/:itemId", removeCartItem);
router.delete("/", clearCart);

export default router;
