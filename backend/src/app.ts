import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOrigins } from "./config/env.js";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middleware/error.middleware.js";
import routes from "./routes/index.js";
import uploadRoutes from "./modules/upload/upload.routes.js";

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
app.use(
  "/api/uploads",
  express.json({ limit: "8mb", strict: true }),
  uploadRoutes,
);
app.use(express.json({ limit: "100kb", strict: true }));

app.use("/api", routes);

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use(errorHandler);
