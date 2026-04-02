import { prisma } from "../../db/db.js";
import { NotFoundError } from "../../utils/http-errors.util.js";

export const createBudget = async (userId, data) => {
  return await prisma.budget.upsert({
    where: {
      userId_category_period: {
        userId,
        category: data.category,
        period: data.period || "MONTHLY",
      },
    },
    update: { limit: data.limit },
    create: { ...data, userId },
  });
};

export const getBudgets = async (userId) => {
  const [budgets, expenses] = await Promise.all([
    prisma.budget.findMany({ where: { userId } }),
    prisma.financialRecord.groupBy({
      by: ["category"],
      where: { 
        userId, 
        type: "EXPENSE",
        date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }, // Current month
        isDeleted: false
      },
      _sum: { amount: true },
    }),
  ]);

  // Combine Budget with Actual Spending and Alert logic
  return budgets.map((b) => {
    const expense = expenses.find((e) => e.category === b.category);
    const actualSpent = expense?._sum.amount || 0;
    const progress = (actualSpent / b.limit) * 100;

    return {
      ...b,
      actualSpent,
      progress: parseFloat(progress.toFixed(2)),
      status: progress >= 100 ? "OVER_BUDGET" : progress >= 80 ? "WARNING" : "HEALTHY",
    };
  });
};

export const deleteBudget = async (userId, budgetId) => {
  const budget = await prisma.budget.findUnique({ where: { id: budgetId } });
  if (!budget || budget.userId !== userId) throw new NotFoundError("Budget not found");

  return await prisma.budget.delete({ where: { id: budgetId } });
};
