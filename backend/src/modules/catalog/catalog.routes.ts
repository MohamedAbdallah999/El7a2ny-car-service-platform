import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  addCompatibility,
  addProductImage,
  adjustInventory,
  createCategory,
  createInventory,
  createProduct,
  deleteProduct,
  getProduct,
  getProductBySlug,
  listCategories,
  listInventory,
  listMovements,
  listProducts,
  removeCompatibility,
  removeProductImage,
  updateCategory,
  updateProduct,
} from "./catalog.controller.js";
import {
  addCompatibilitySchema,
  addProductImageSchema,
  adjustInventorySchema,
  createInventorySchema,
  createProductCategorySchema,
  createProductSchema,
  productListQuerySchema,
  updateProductCategorySchema,
  updateProductSchema,
} from "./catalog.validation.js";

const router = Router();
const admin = authorize(UserRole.ADMIN);
const superAdmin = authorize(UserRole.SUPER_ADMIN);

router.get("/categories", listCategories);
router.post(
  "/categories",
  authenticate,
  superAdmin,
  validateBody(createProductCategorySchema, "Invalid category data", true),
  createCategory,
);
router.patch(
  "/categories/:categoryId",
  authenticate,
  superAdmin,
  validateBody(updateProductCategorySchema, "Invalid category data", true),
  updateCategory,
);

router.get("/inventory", authenticate, admin, listInventory);
router.post(
  "/inventory",
  authenticate,
  admin,
  validateBody(createInventorySchema, "Invalid inventory data", true),
  createInventory,
);
router.post(
  "/inventory/:inventoryId/adjust",
  authenticate,
  admin,
  validateBody(adjustInventorySchema, "Invalid inventory adjustment", true),
  adjustInventory,
);
router.get(
  "/inventory/:inventoryId/movements",
  authenticate,
  admin,
  listMovements,
);

router.get(
  "/products",
  validateQuery(productListQuerySchema, "Invalid query parameters", true),
  listProducts,
);
router.get("/products/slug/:slug", getProductBySlug);
router.post(
  "/products",
  authenticate,
  admin,
  validateBody(createProductSchema, "Invalid product data", true),
  createProduct,
);
router.get("/products/:productId", getProduct);
router.patch(
  "/products/:productId",
  authenticate,
  admin,
  validateBody(updateProductSchema, "Invalid product data", true),
  updateProduct,
);
router.delete("/products/:productId", authenticate, admin, deleteProduct);

router.post(
  "/products/:productId/images",
  authenticate,
  admin,
  validateBody(addProductImageSchema, "Invalid image data", true),
  addProductImage,
);
router.delete(
  "/products/:productId/images/:imageId",
  authenticate,
  admin,
  removeProductImage,
);

router.post(
  "/products/:productId/compatibility",
  authenticate,
  admin,
  validateBody(addCompatibilitySchema, "Invalid compatibility data", true),
  addCompatibility,
);
router.delete(
  "/products/:productId/compatibility/:compatibilityId",
  authenticate,
  admin,
  removeCompatibility,
);

export default router;
