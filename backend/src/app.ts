import cors from "cors";
import express from "express";
import helmet from "helmet";
import authRoutes from "./auth/auth.routes.js";
import { corsOrigins } from "./config/env.js";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middleware/error.middleware.js";

export const app = express();

app.use(helmet());
app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      // Native/mobile clients do not send Origin. Browser origins must be allow-listed.
      if (!origin || corsOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new AppError(403, "Origin is not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "100kb", strict: true }));

app.use("/api/auth", authRoutes);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use(errorHandler);
