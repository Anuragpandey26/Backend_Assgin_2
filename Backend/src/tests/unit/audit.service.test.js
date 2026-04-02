import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as auditService from "../../modules/audit/audit.service.js";
import { mockPrisma } from "../mocks/prisma.mock.js";

describe("auditService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLog", () => {
    it("should create an audit log entry", async () => {
      mockPrisma.auditLog.create.mockResolvedValue({
        id: "log-1",
        userId: "user-1",
        action: "LOGIN",
        entityId: "user-1",
        metadata: { ip: "127.0.0.1" },
      });

      const result = await auditService.createLog("user-1", "LOGIN", "user-1", { ip: "127.0.0.1" });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          action: "LOGIN",
          entityId: "user-1",
          metadata: { ip: "127.0.0.1" },
        },
      });
      expect(result.action).toBe("LOGIN");
    });

    it("should handle errors gracefully without throwing", async () => {
      mockPrisma.auditLog.create.mockRejectedValue(new Error("DB error"));

      // Should not throw - audit logging is non-critical
      await expect(auditService.createLog("user-1", "LOGIN")).resolves.not.toThrow();
    });
  });

  describe("getLogs", () => {
    it("should return logs with user info", async () => {
      const logs = [
        {
          id: "log-1",
          userId: "u1",
          action: "LOGIN",
          createdAt: new Date(),
          user: { id: "u1", name: "Admin", email: "admin@test.com" },
        },
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);

      const result = await auditService.getLogs({});

      expect(result).toHaveLength(1);
      expect(result[0].user.name).toBe("Admin");
    });

    it("should filter by userId and action", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      await auditService.getLogs({ userId: "u1", action: "LOGIN" });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: "u1", action: "LOGIN" }),
        })
      );
    });

    it("should support date range filtering", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      await auditService.getLogs({
        startDate: "2026-01-01",
        endDate: "2026-12-31",
      });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );
    });

    it("should support pagination", async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);

      await auditService.getLogs({ page: 2, limit: 10 });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });
});
