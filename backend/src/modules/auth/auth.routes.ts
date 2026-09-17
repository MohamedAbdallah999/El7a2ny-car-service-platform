import { Router } from "express";
import { register, login, getMe } from "./auth.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../middleware/validation.middleware.js";
import {
  loginLimiter,
  registrationLimiter,
} from "../../middleware/rate-limit.middleware.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

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
  "/login",
  loginLimiter,
  validateBody(loginSchema, "Invalid email or password"),
  login,
);
router.get("/me", authenticate, getMe);

export default router;
