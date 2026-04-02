import { Router } from "express";
import * as financeController from "./finance.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.config.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createRecordSchema, updateRecordSchema, getRecordsQuerySchema } from "./finance.validator.js";

const financeRouter = Router();

financeRouter.use(authMiddleware);

// Viewer/Analyst/Admin can GET records (Filtering logic in service handles visibility)
financeRouter.get(
  "/",
  checkPermission(PERMISSIONS.FINANCE_READ_OWN), // Minimum requirement
  validate(getRecordsQuerySchema),
  financeController.getRecords
);

// Only ADMIN can CREATE/UPDATE/DELETE records
financeRouter.post(
  "/",
  checkPermission(PERMISSIONS.FINANCE_CREATE),
  validate(createRecordSchema),
  financeController.createRecord
);

financeRouter.patch(
  "/:id",
  checkPermission(PERMISSIONS.FINANCE_UPDATE_ALL),
  validate(updateRecordSchema),
  financeController.updateRecord
);

financeRouter.delete(
  "/:id",
  checkPermission(PERMISSIONS.FINANCE_DELETE_ALL),
  financeController.deleteRecord
);

export default financeRouter;
