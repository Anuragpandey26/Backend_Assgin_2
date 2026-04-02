import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware.js";
import { globalErrorHandler } from "./error-handlers/global.error-handler.js";
import { jwtErrorHandler } from "./error-handlers/jwt.error-handler.js";
import { nonExistingRoutesErrorHandler } from "./error-handlers/non-existing-route.error-handler.js";
import appRouter from "./modules/app/index.js";

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

// Health Check and Utility Routes
app.get("/health", (req, res) => {
  return res.send("Finance Dashboard API - Modular Structure");
});


// Modular Routes
app.use("/api/v1", appRouter);

// Catch-all for non-existing routes (404)
app.use(nonExistingRoutesErrorHandler);

// Global Error Handlers
app.use(jwtErrorHandler);
app.use(globalErrorHandler);

export default app;
