import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as budgetService from "../../modules/budget/budget.service.js";
import { mockPrisma } from "../mocks/prisma.mock.js";
import { NotFoundError } from "../../utils/http-errors.util.js";

// Add missing prisma methods needed by budget service
mockPrisma.budget.upsert = vi.fn();
mockPrisma.financialRecord.groupBy = vi.fn();

describe("budgetService", () => {
  const userId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBudget", () => {
    it("should upsert a budget for the user", async () => {
      const data = { category: "Food", limit: 500, period: "MONTHLY" };
      const expected = { id: "b1", userId, ...data };
      mockPrisma.budget.upsert.mockResolvedValue(expected);

      const result = await budgetService.createBudget(userId, data);

      expect(mockPrisma.budget.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_category_period: {
              userId,
              category: "Food",
              period: "MONTHLY",
            },
          },
          update: { limit: 500 },
          create: expect.objectContaining({ userId, category: "Food" }),
        })
      );
      expect(result.id).toBe("b1");
    });
  });

  describe("getBudgets", () => {
    it("should return budgets with spending progress and status", async () => {
      const budgets = [
        { id: "b1", userId, category: "Food", limit: 1000, period: "MONTHLY" },
        { id: "b2", userId, category: "Rent", limit: 500, period: "MONTHLY" },
      ];
      const expenses = [
        { category: "Food", _sum: { amount: 900 } },  // 90% - WARNING
        { category: "Rent", _sum: { amount: 600 } },  // 120% - OVER_BUDGET
      ];

      mockPrisma.budget.findMany.mockResolvedValue(budgets);
      mockPrisma.financialRecord.groupBy.mockResolvedValue(expenses);

      const result = await budgetService.getBudgets(userId);

      expect(result).toHaveLength(2);
      expect(result[0].actualSpent).toBe(900);
      expect(result[0].status).toBe("WARNING");
      expect(result[1].actualSpent).toBe(600);
      expect(result[1].status).toBe("OVER_BUDGET");
    });

    it("should return HEALTHY status for budgets with low spending", async () => {
      const budgets = [
        { id: "b1", userId, category: "Fun", limit: 1000, period: "MONTHLY" },
      ];
      mockPrisma.budget.findMany.mockResolvedValue(budgets);
      mockPrisma.financialRecord.groupBy.mockResolvedValue([]); // No expenses

      const result = await budgetService.getBudgets(userId);

      expect(result[0].actualSpent).toBe(0);
      expect(result[0].status).toBe("HEALTHY");
    });
  });

  describe("deleteBudget", () => {
    it("should throw NotFoundError if budget does not exist", async () => {
      mockPrisma.budget.findUnique.mockResolvedValue(null);

      await expect(budgetService.deleteBudget(userId, "bad-id"))
        .rejects.toThrow(NotFoundError);
    });

    it("should throw NotFoundError if budget belongs to another user", async () => {
      mockPrisma.budget.findUnique.mockResolvedValue({ id: "b1", userId: "other-user" });

      await expect(budgetService.deleteBudget(userId, "b1"))
        .rejects.toThrow(NotFoundError);
    });

    it("should delete the budget if it belongs to the user", async () => {
      const budget = { id: "b1", userId };
      mockPrisma.budget.findUnique.mockResolvedValue(budget);
      mockPrisma.budget.delete.mockResolvedValue(budget);

      const result = await budgetService.deleteBudget(userId, "b1");

      expect(mockPrisma.budget.delete).toHaveBeenCalledWith({ where: { id: "b1" } });
      expect(result.id).toBe("b1");
    });
  });
});
