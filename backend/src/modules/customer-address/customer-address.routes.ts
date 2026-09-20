import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from "./customer-address.controller.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "./customer-address.validation.js";

const router = Router();
const customer = authorize(UserRole.CUSTOMER);

router.use(authenticate, customer);

router.get("/", listAddresses);
router.post(
  "/",
  validateBody(createAddressSchema, "Invalid address data", true),
  createAddress,
);
router.patch(
  "/:addressId",
  validateBody(updateAddressSchema, "Invalid address data", true),
  updateAddress,
);
router.delete("/:addressId", deleteAddress);

export default router;
