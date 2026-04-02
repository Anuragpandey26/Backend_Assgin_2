import { Router } from "express";
import * as dashboardController from "./dashboard.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.config.js";

const dashboardRouter = Router();

// Viewer/Analyst/Admin can see summary
dashboardRouter.get(
  "/summary",
  authMiddleware,
  checkPermission(PERMISSIONS.DASHBOARD_VIEW),
  dashboardController.getSummary
);

export default dashboardRouter;
