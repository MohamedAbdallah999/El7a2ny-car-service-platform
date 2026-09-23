import { Router } from "express";
import { UserRole } from "../../generated/prisma/client.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import {
  downloadFile,
  downloadPublicImage,
  uploadFile,
} from "./upload.controller.js";
import { uploadFileSchema } from "./upload.validation.js";

const router = Router();

router.get("/public/:fileName", downloadPublicImage);

router.get(
  "/:fileName",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  downloadFile,
);

router.post(
  "/",
  authenticate,
  authorize(UserRole.ADMIN),
  validateBody(uploadFileSchema, "Invalid upload", true),
  uploadFile,
);

export default router;
