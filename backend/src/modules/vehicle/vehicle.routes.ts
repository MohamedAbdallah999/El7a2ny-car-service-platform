import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  createMake,
  createModel,
  createVehicle,
  deleteVehicle,
  getVehicle,
  listMakes,
  listModels,
  listMyVehicles,
  updateMake,
  updateModel,
  updateVehicle,
} from "./vehicle.controller.js";
import {
  createMakeSchema,
  createModelSchema,
  createVehicleSchema,
  updateMakeSchema,
  updateModelSchema,
  updateVehicleSchema,
} from "./vehicle.validation.js";

const router = Router();
const superAdmin = authorize(UserRole.SUPER_ADMIN);
const customer = authorize(UserRole.CUSTOMER);

// Reference data: readable by anyone, writable by the Super Admin only.
router.get("/makes", listMakes);
router.post(
  "/makes",
  authenticate,
  superAdmin,
  validateBody(createMakeSchema, "Invalid vehicle make data", true),
  createMake,
);
router.patch(
  "/makes/:makeId",
  authenticate,
  superAdmin,
  validateBody(updateMakeSchema, "Invalid vehicle make data", true),
  updateMake,
);
router.get("/makes/:makeId/models", listModels);
router.post(
  "/makes/:makeId/models",
  authenticate,
  superAdmin,
  validateBody(createModelSchema, "Invalid vehicle model data", true),
  createModel,
);
router.patch(
  "/models/:modelId",
  authenticate,
  superAdmin,
  validateBody(updateModelSchema, "Invalid vehicle model data", true),
  updateModel,
);

// The authenticated customer's own garage.
router.get("/", authenticate, customer, listMyVehicles);
router.post(
  "/",
  authenticate,
  customer,
  validateBody(createVehicleSchema, "Invalid vehicle data", true),
  createVehicle,
);
router.get("/:vehicleId", authenticate, customer, getVehicle);
router.patch(
  "/:vehicleId",
  authenticate,
  customer,
  validateBody(updateVehicleSchema, "Invalid vehicle data", true),
  updateVehicle,
);
router.delete("/:vehicleId", authenticate, customer, deleteVehicle);

export default router;
