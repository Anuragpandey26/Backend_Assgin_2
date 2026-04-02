import * as budgetService from "./budget.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

export const createBudget = asyncHandler(async (req, res) => {
  const budget = await budgetService.createBudget(req.user.sub, req.body);
  res.status(201).json({ success: true, data: budget });
});

export const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getBudgets(req.user.sub);
  res.status(200).json({ success: true, data: budgets });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  await budgetService.deleteBudget(req.user.sub, req.params.id);
  res.status(200).json({ success: true, message: "Budget deleted successfully" });
});
