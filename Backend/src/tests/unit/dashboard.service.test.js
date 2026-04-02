import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as dashboardService from "../../modules/dashboard/dashboard.service.js";
import { mockPrisma } from "../mocks/prisma.mock.js";

describe("dashboardService", () => {
  const userId = "user-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSummary", () => {
    const mockRecords = [
      { id: "r1", type: "INCOME", amount: 1000, category: "Salary", date: new Date("2026-04-01") },
      { id: "r2", type: "EXPENSE", amount: 200, category: "Food", date: new Date("2026-04-02") },
      { id: "r3", type: "EXPENSE", amount: 300, category: "Rent", date: new Date("2026-03-30") },
      { id: "r4", type: "INCOME", amount: 500, category: "Freelance", date: new Date("2026-03-28") },
    ];

    it("should calculate correct totals for a non-admin user", async () => {
      mockPrisma.financialRecord.findMany.mockResolvedValue(mockRecords);

      const result = await dashboardService.getSummary(userId, "ANALYST");

      expect(mockPrisma.financialRecord.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ userId, isDeleted: false }),
      });
      expect(result.totalIncome).toBe(1500);
      expect(result.totalExpenses).toBe(500);
      expect(result.netBalance).toBe(1000);
    });

    it("should fetch all records for ADMIN (no userId filter)", async () => {
      mockPrisma.financialRecord.findMany.mockResolvedValue(mockRecords);

      const result = await dashboardService.getSummary(userId, "ADMIN");

      expect(mockPrisma.financialRecord.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false },
      });
      expect(result.totalIncome).toBe(1500);
    });

    it("should compute category-wise breakdown", async () => {
      mockPrisma.financialRecord.findMany.mockResolvedValue(mockRecords);

      const result = await dashboardService.getSummary(userId, "ADMIN");

      expect(result.categoryWise).toEqual({
        Salary: 1000,
        Food: -200,
        Rent: -300,
        Freelance: 500,
      });
    });

    it("should limit recent activity to 10 items", async () => {
      const manyRecords = Array.from({ length: 15 }, (_, i) => ({
        id: `r${i}`, type: "INCOME", amount: 10, category: "Test", date: new Date(2026, 3, i + 1),
      }));
      mockPrisma.financialRecord.findMany.mockResolvedValue(manyRecords);

      const result = await dashboardService.getSummary(userId, "ADMIN");

      expect(result.recentActivity).toHaveLength(10);
    });

    it("should handle empty records gracefully", async () => {
      mockPrisma.financialRecord.findMany.mockResolvedValue([]);

      const result = await dashboardService.getSummary(userId, "ADMIN");

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.netBalance).toBe(0);
      expect(result.recentActivity).toHaveLength(0);
    });
  });
});
