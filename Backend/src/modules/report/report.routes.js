import { Router } from "express";
import * as reportController from "./report.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.config.js";
import multer from "multer";

const reportRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

reportRouter.use(authMiddleware);

reportRouter.get("/export/csv", checkPermission(PERMISSIONS.DASHBOARD_VIEW), reportController.exportCsv);
reportRouter.get("/export/pdf", checkPermission(PERMISSIONS.DASHBOARD_VIEW), reportController.exportPdf);
reportRouter.post("/import", checkPermission(PERMISSIONS.FINANCE_CREATE), upload.single("file"), reportController.importCsv);

export default reportRouter;
