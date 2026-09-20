import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  addCompatibility,
  createCategory,
  createService,
  deleteService,
  getService,
  listCategories,
  listServices,
  removeCompatibility,
  updateCategory,
  updateService,
} from "./service.controller.js";
import {
  createCategorySchema,
  createCompatibilitySchema,
  createServiceSchema,
  serviceListQuerySchema,
  updateCategorySchema,
  updateServiceSchema,
} from "./service.validation.js";

const router = Router();
const admin = authorize(UserRole.ADMIN);
const superAdmin = authorize(UserRole.SUPER_ADMIN);

router.get("/categories", listCategories);
router.post(
  "/categories",
  authenticate,
  superAdmin,
  validateBody(createCategorySchema, "Invalid category data", true),
  createCategory,
);
router.patch(
  "/categories/:categoryId",
  authenticate,
  superAdmin,
  validateBody(updateCategorySchema, "Invalid category data", true),
  updateCategory,
);

router.get(
  "/",
  validateQuery(serviceListQuerySchema, "Invalid query parameters", true),
  listServices,
);
router.post(
  "/",
  authenticate,
  admin,
  validateBody(createServiceSchema, "Invalid service data", true),
  createService,
);
router.get("/:serviceId", getService);
router.patch(
  "/:serviceId",
  authenticate,
  admin,
  validateBody(updateServiceSchema, "Invalid service data", true),
  updateService,
);
router.delete("/:serviceId", authenticate, admin, deleteService);

router.post(
  "/:serviceId/compatibility",
  authenticate,
  admin,
  validateBody(createCompatibilitySchema, "Invalid compatibility data", true),
  addCompatibility,
);
router.delete(
  "/:serviceId/compatibility/:compatibilityId",
  authenticate,
  admin,
  removeCompatibility,
);

export default router;
