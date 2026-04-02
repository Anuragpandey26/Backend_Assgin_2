import { prisma } from "../../db/db.js";

import { toDashboardSummaryResponse } from "../../dto/dashboard.dto.js";

export const getSummary = async (userId, userRole) => {
  const where = {
    isDeleted: false,
    ...(userRole !== "ADMIN" && { userId }),
  };

  const records = await prisma.financialRecord.findMany({ where });

  const totalIncome = records
    .filter((r) => r.type === "INCOME")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = records
    .filter((r) => r.type === "EXPENSE")
    .reduce((sum, r) => sum + r.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const categoryWise = records.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + (r.type === "INCOME" ? r.amount : -r.amount);
    return acc;
  }, {});

  const recentActivity = records
    .sort((a, b) => b.date - a.date)
    .slice(0, 10); // Show more in the full list if needed

  const summary = {
    totalIncome,
    totalExpenses,
    netBalance,
    categoryWise,
    recentActivity,
  };

  return toDashboardSummaryResponse(summary);
};
