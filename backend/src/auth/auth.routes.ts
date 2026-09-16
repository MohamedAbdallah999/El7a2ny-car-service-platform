import { Router } from "express";
import { register, login, getMe } from "./auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { rateLimit } from "express-rate-limit";

const router = Router();

router.use((_request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many registrations. Please try again later." },
});

router.post("/register", registrationLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", authenticate, getMe);

export default router;
