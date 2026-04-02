import { Router } from "express";
import * as auditController from "./audit.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.config.js";

const auditRouter = Router();

// Only ADMINs with USER_MANAGE permission (or audit-specific if we added one) can view logs
auditRouter.get(
  "/", 
  authMiddleware, 
  checkPermission(PERMISSIONS.USER_MANAGE), 
  auditController.getAuditLogs
);

export default auditRouter;
