import { Router } from "express";
import * as intelligenceController from "./intelligence.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.config.js";

const intelligenceRouter = Router();

intelligenceRouter.use(authMiddleware);

intelligenceRouter.get("/forecasting", checkPermission(PERMISSIONS.DASHBOARD_VIEW), intelligenceController.getForecasting);

export default intelligenceRouter;
