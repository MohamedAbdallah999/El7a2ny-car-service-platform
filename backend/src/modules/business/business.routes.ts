import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  addDocument,
  addHoliday,
  closeBranch,
  createBranch,
  createBusiness,
  getBusinessById,
  getBusinessBySlug,
  listAllBusinesses,
  listBranches,
  listDocuments,
  listHolidays,
  listMyBusinesses,
  listPublicBusinesses,
  removeHoliday,
  reviewDocument,
  setBranchHours,
  setBusinessStatus,
  setBusinessVerification,
  updateBranch,
  updateBusiness,
} from "./business.controller.js";
import {
  businessHoursSchema,
  businessListQuerySchema,
  businessStatusSchema,
  businessVerificationSchema,
  createBranchSchema,
  createBusinessSchema,
  createDocumentSchema,
  createHolidaySchema,
  reviewDocumentSchema,
  updateBranchSchema,
  updateBusinessSchema,
} from "./business.validation.js";

const router = Router();

const admin = authorize(UserRole.ADMIN);
const superAdmin = authorize(UserRole.SUPER_ADMIN);
const adminOrSuperAdmin = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

// Order matters: literal segments ("mine", "admin/all", "slug/:slug") must be
// registered before "/:businessId" so Express doesn't treat them as an id.
router.get(
  "/",
  validateQuery(businessListQuerySchema, "Invalid query parameters", true),
  listPublicBusinesses,
);
router.get(
  "/mine",
  authenticate,
  admin,
  validateQuery(businessListQuerySchema, "Invalid query parameters", true),
  listMyBusinesses,
);
router.get(
  "/admin/all",
  authenticate,
  superAdmin,
  validateQuery(businessListQuerySchema, "Invalid query parameters", true),
  listAllBusinesses,
);
router.get("/slug/:slug", getBusinessBySlug);

router.post(
  "/",
  authenticate,
  admin,
  validateBody(createBusinessSchema, "Invalid business data", true),
  createBusiness,
);

router.get("/:businessId", authenticate, adminOrSuperAdmin, getBusinessById);
router.patch(
  "/:businessId",
  authenticate,
  admin,
  validateBody(updateBusinessSchema, "Invalid business data", true),
  updateBusiness,
);
router.patch(
  "/:businessId/verification",
  authenticate,
  superAdmin,
  validateBody(businessVerificationSchema, "Invalid verification data", true),
  setBusinessVerification,
);
router.patch(
  "/:businessId/status",
  authenticate,
  superAdmin,
  validateBody(businessStatusSchema, "Invalid status", true),
  setBusinessStatus,
);

router.get("/:businessId/branches", listBranches);
router.post(
  "/:businessId/branches",
  authenticate,
  admin,
  validateBody(createBranchSchema, "Invalid branch data", true),
  createBranch,
);
router.patch(
  "/:businessId/branches/:branchId",
  authenticate,
  admin,
  validateBody(updateBranchSchema, "Invalid branch data", true),
  updateBranch,
);
router.delete(
  "/:businessId/branches/:branchId",
  authenticate,
  admin,
  closeBranch,
);
router.put(
  "/:businessId/branches/:branchId/hours",
  authenticate,
  admin,
  validateBody(businessHoursSchema, "Invalid business hours", true),
  setBranchHours,
);
router.get("/:businessId/branches/:branchId/holidays", listHolidays);
router.post(
  "/:businessId/branches/:branchId/holidays",
  authenticate,
  admin,
  validateBody(createHolidaySchema, "Invalid holiday data", true),
  addHoliday,
);
router.delete(
  "/:businessId/branches/:branchId/holidays/:holidayId",
  authenticate,
  admin,
  removeHoliday,
);

router.get(
  "/:businessId/documents",
  authenticate,
  adminOrSuperAdmin,
  listDocuments,
);
router.post(
  "/:businessId/documents",
  authenticate,
  admin,
  validateBody(createDocumentSchema, "Invalid document data", true),
  addDocument,
);
router.patch(
  "/:businessId/documents/:documentId/review",
  authenticate,
  superAdmin,
  validateBody(reviewDocumentSchema, "Invalid review data", true),
  reviewDocument,
);

export default router;
