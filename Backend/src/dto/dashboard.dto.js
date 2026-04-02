/**
 * Dashboard Data Transfer Object
 * Formats dashboard summary data for client responses.
 */

import { toFinanceRecordResponse } from "./finance.dto.js";

export const toDashboardSummaryResponse = (summary) => {
  if (!summary) return null;

  return {
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpenses,
    netBalance: summary.netBalance,
    categoryWise: summary.categoryWise,
    recentActivity: summary.recentActivity.map(toFinanceRecordResponse),
  };
};
