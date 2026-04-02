import { Router } from "express";
import authRouter from "../auth/auth.routes.js";
import userRouter from "../user/user.routes.js";
import financeRouter from "../finance/finance.routes.js";
import dashboardRouter from "../dashboard/dashboard.routes.js";
import budgetRouter from "../budget/budget.routes.js";
import intelligenceRouter from "../intelligence/intelligence.routes.js";
import reportRouter from "../report/report.routes.js";
import auditRouter from "../audit/audit.routes.js";

const appRouter = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/users", userRouter);
appRouter.use("/finance", financeRouter);
appRouter.use("/dashboard", dashboardRouter);
appRouter.use("/budgets", budgetRouter);
appRouter.use("/intelligence", intelligenceRouter);
appRouter.use("/reports", reportRouter);
appRouter.use("/audit", auditRouter);

export default appRouter;
