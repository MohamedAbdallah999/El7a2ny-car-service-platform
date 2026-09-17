import { Router } from "express";
import {
  createAdminInvitation,
  forgotPassword,
  getMe,
  login,
  register,
  registerAdmin,
  resetPassword,
  verifyAdminRegistration,
  verifyLogin,
  verifyRegistration,
} from "./auth.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import {
  loginLimiter,
  registrationLimiter,
  verificationLimiter,
} from "../../middleware/rate-limit.middleware.js";
import { UserRole } from "../../generated/prisma/client.js";
import {
  adminInvitationSchema,
  adminRegistrationSchema,
  forgotPasswordSchema,
  loginSchema,
  loginVerificationSchema,
  registerSchema,
  registrationVerificationSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.use((_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});

router.post(
  "/register",
  registrationLimiter,
  validateBody(registerSchema, "Invalid registration data", true),
  register,
);
router.post(
  "/register/verify",
  verificationLimiter,
  validateBody(registrationVerificationSchema, "Invalid verification data"),
  verifyRegistration,
);
router.post(
  "/admin/register",
  registrationLimiter,
  validateBody(adminRegistrationSchema, "Invalid registration data", true),
  registerAdmin,
);
router.post(
  "/admin/register/verify",
  verificationLimiter,
  validateBody(registrationVerificationSchema, "Invalid verification data"),
  verifyAdminRegistration,
);
router.post(
  "/login",
  loginLimiter,
  validateBody(loginSchema, "Invalid email or password"),
  login,
);
router.post(
  "/login/verify",
  verificationLimiter,
  validateBody(loginVerificationSchema, "Invalid verification data"),
  verifyLogin,
);
router.post(
  "/password/forgot",
  loginLimiter,
  validateBody(forgotPasswordSchema, "Invalid email", true),
  forgotPassword,
);
router.post(
  "/password/reset",
  verificationLimiter,
  validateBody(resetPasswordSchema, "Invalid reset data", true),
  resetPassword,
);
router.post(
  "/admin/invitations",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validateBody(adminInvitationSchema, "Invalid invitation data", true),
  createAdminInvitation,
);
router.get("/me", authenticate, getMe);

export default router;
