import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as financeService from "../../modules/finance/finance.service.js";
import { mockPrisma } from "../mocks/prisma.mock.js";
import { NotFoundError, UnauthorizedError } from "../../utils/http-errors.util.js";

// Mock audit service
vi.mock("../../modules/audit/audit.service.js", () => ({
  createLog: vi.fn(),
}));

describe("financeService", () => {
  const userId = "user-123";
  const userRole = "ANALYST";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createRecord", () => {
    it("should create a record and return it formatted", async () => {
      const input = {
        amount: 100,
        type: "EXPENSE",
        category: "Food",
        paymentMethod: "Cash",
      };

      mockPrisma.financialRecord.create.mockResolvedValue({
        id: "record-1",
        ...input,
        userId,
        createdAt: new Date(),
      });

      const result = await financeService.createRecord(userId, input);

      expect(mockPrisma.financialRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId, ...input }),
      });
      expect(result.id).toBe("record-1");
    });
  });

  describe("getRecords", () => {
    it("should return analyst's own records", async () => {
      const mockRecord = { id: "r1", userId, amount: 10, type: "INCOME", category: "Test", date: new Date() };
      mockPrisma.financialRecord.findMany.mockResolvedValue([mockRecord]);
      mockPrisma.financialRecord.count.mockResolvedValue(1);

      const result = await financeService.getRecords(userId, "ANALYST", { page: 1, limit: 10 });

      expect(mockPrisma.financialRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId }),
        })
      );
      expect(result.records).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it("should return all records for ADMIN", async () => {
      const mockRecord = { id: "r1", userId: "other-user", amount: 10, type: "INCOME", category: "Test", date: new Date() };
      mockPrisma.financialRecord.findMany.mockResolvedValue([mockRecord]);
      mockPrisma.financialRecord.count.mockResolvedValue(1);

      const result = await financeService.getRecords(userId, "ADMIN", { page: 1, limit: 10 });

      expect(mockPrisma.financialRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ userId }),
        })
      );
      expect(result.records).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe("deleteRecord", () => {
    it("should throw NotFoundError if record does not exist", async () => {
      mockPrisma.financialRecord.findUnique.mockResolvedValue(null);

      await expect(financeService.deleteRecord("invalid-id", userId, userRole))
        .rejects.toThrow(NotFoundError);
    });

    it("should throw UnauthorizedError if user is not authorized to delete", async () => {
      mockPrisma.financialRecord.findUnique.mockResolvedValue({ 
        id: "r1", userId: "other-user", isDeleted: false 
      });

      await expect(financeService.deleteRecord("r1", userId, "VIEWER"))
        .rejects.toThrow(UnauthorizedError);
    });

    it("should soft delete the record if authorized", async () => {
      mockPrisma.financialRecord.findUnique.mockResolvedValue({ 
        id: "r1", userId, isDeleted: false 
      });
      mockPrisma.financialRecord.update.mockResolvedValue({ 
        id: "r1", userId, isDeleted: true 
      });

      const result = await financeService.deleteRecord("r1", userId, "ANALYST");

      expect(mockPrisma.financialRecord.update).toHaveBeenCalledWith({
        where: { id: "r1" },
        data: { isDeleted: true },
      });
      expect(result.id).toBe("r1");
    });
  });
});
