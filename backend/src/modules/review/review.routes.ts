import { Router } from "express";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  createBusinessReview,
  createProductReview,
  listBusinessReviews,
  listProductReviews,
  replyToBusinessReview,
  setBusinessReviewStatus,
  setProductReviewStatus,
} from "./review.controller.js";
import {
  businessReviewListQuerySchema,
  createBusinessReviewSchema,
  createProductReviewSchema,
  productReviewListQuerySchema,
  replyToReviewSchema,
  reviewStatusUpdateSchema,
} from "./review.validation.js";

const router = Router();
const customer = authorize(UserRole.CUSTOMER);
const admin = authorize(UserRole.ADMIN);
const superAdmin = authorize(UserRole.SUPER_ADMIN);

router.get(
  "/business",
  optionalAuthenticate,
  validateQuery(businessReviewListQuerySchema, "Invalid query parameters", true),
  listBusinessReviews,
);
router.post(
  "/business",
  authenticate,
  customer,
  validateBody(createBusinessReviewSchema, "Invalid review data", true),
  createBusinessReview,
);
router.patch(
  "/business/:reviewId/reply",
  authenticate,
  admin,
  validateBody(replyToReviewSchema, "Invalid reply", true),
  replyToBusinessReview,
);
router.patch(
  "/business/:reviewId/status",
  authenticate,
  superAdmin,
  validateBody(reviewStatusUpdateSchema, "Invalid status", true),
  setBusinessReviewStatus,
);

router.get(
  "/product",
  optionalAuthenticate,
  validateQuery(productReviewListQuerySchema, "Invalid query parameters", true),
  listProductReviews,
);
router.post(
  "/product",
  authenticate,
  customer,
  validateBody(createProductReviewSchema, "Invalid review data", true),
  createProductReview,
);
router.patch(
  "/product/:reviewId/status",
  authenticate,
  superAdmin,
  validateBody(reviewStatusUpdateSchema, "Invalid status", true),
  setProductReviewStatus,
);

export default router;
