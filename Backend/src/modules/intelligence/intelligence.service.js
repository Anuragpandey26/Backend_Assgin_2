import { prisma } from "../../db/db.js";
import { calculateTrend } from "../../utils/forecast.util.js";
import { convertCurrency } from "../../utils/currency.util.js";

export const getForecasting = async (userId, userRole) => {
  const where = {
    userId: userRole === "ADMIN" ? undefined : userId,
    type: "EXPENSE",
    isDeleted: false,
  };

  const records = await prisma.financialRecord.findMany({ 
    where,
    orderBy: { date: "asc" }
  });

  // Normalize all to USD for trend calculation
  const normalizedRecords = records.map(r => ({
    ...r,
    amount: convertCurrency(r.amount, r.currency, "USD")
  }));

  const trend = calculateTrend(normalizedRecords);

  return {
    currentMonthlyAverage: normalizedRecords.length > 0 
      ? (normalizedRecords.reduce((sum, r) => sum + r.amount, 0) / normalizedRecords.length).toFixed(2)
      : 0,
    forecast: trend,
    insight: trend?.trend === "INCREASING" 
      ? "Your spending is on an upward trend. Consider reviewing your budgets."
      : trend?.trend === "DECREASING"
      ? "Great job! Your spending is decreasing compared to your history."
      : "Your spending remains stable.",
  };
};
