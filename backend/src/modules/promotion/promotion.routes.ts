import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  attachPromotionTarget,
  createPromotion,
  deactivatePromotion,
  listPromotions,
  updatePromotion,
  validatePromotionCode,
} from "./promotion.controller.js";
import {
  attachTargetSchema,
  createPromotionSchema,
  promotionListQuerySchema,
  updatePromotionSchema,
} from "./promotion.validation.js";

const router = Router();
const manager = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

router.get(
  "/",
  validateQuery(promotionListQuerySchema, "Invalid query parameters", true),
  listPromotions,
);
router.get("/code/:code", validatePromotionCode);
router.post(
  "/",
  authenticate,
  manager,
  validateBody(createPromotionSchema, "Invalid promotion data", true),
  createPromotion,
);
router.patch(
  "/:promotionId",
  authenticate,
  manager,
  validateBody(updatePromotionSchema, "Invalid promotion data", true),
  updatePromotion,
);
router.delete("/:promotionId", authenticate, manager, deactivatePromotion);
router.post(
  "/:promotionId/targets",
  authenticate,
  manager,
  validateBody(attachTargetSchema, "Invalid target data", true),
  attachPromotionTarget,
);

export default router;
