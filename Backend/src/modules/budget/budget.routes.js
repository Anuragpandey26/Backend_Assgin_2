import { Router } from "express";
import * as budgetController from "./budget.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { PERMISSIONS } from "../../config/permissions.config.js";
import { createBudgetSchema } from "./budget.validator.js";

const budgetRouter = Router();

budgetRouter.use(authMiddleware);

budgetRouter.get("/", checkPermission(PERMISSIONS.FINANCE_READ_OWN), budgetController.getBudgets);
budgetRouter.post("/", checkPermission(PERMISSIONS.FINANCE_CREATE), validate(createBudgetSchema), budgetController.createBudget);
budgetRouter.delete("/:id", checkPermission(PERMISSIONS.FINANCE_DELETE_ALL), budgetController.deleteBudget);

export default budgetRouter;
