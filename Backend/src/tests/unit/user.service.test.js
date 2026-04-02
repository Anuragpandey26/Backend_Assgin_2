import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as userService from "../../modules/user/user.service.js";
import { mockPrisma } from "../mocks/prisma.mock.js";
import { NotFoundError } from "../../utils/http-errors.util.js";

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should return a formatted list of all users", async () => {
      const users = [
        { id: "u1", name: "Admin", email: "admin@test.com", role: "ADMIN", status: "ACTIVE" },
        { id: "u2", name: "Viewer", email: "viewer@test.com", role: "VIEWER", status: "ACTIVE" },
      ];
      mockPrisma.user.findMany.mockResolvedValue(users);

      const result = await userService.getAllUsers();

      expect(mockPrisma.user.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("u1");
      // Password should not be in the response (DTO strips it)
      expect(result[0].password).toBeUndefined();
    });
  });

  describe("updateUserRole", () => {
    it("should throw NotFoundError if user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.updateUserRole("bad-id", "ADMIN"))
        .rejects.toThrow(NotFoundError);
    });

    it("should update and return the user with new role", async () => {
      const user = { id: "u1", name: "Test", email: "t@t.com", role: "VIEWER", status: "ACTIVE" };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user, role: "ADMIN" });

      const result = await userService.updateUserRole("u1", "ADMIN");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { role: "ADMIN" },
      });
      expect(result.role).toBe("ADMIN");
    });
  });

  describe("updateUserStatus", () => {
    it("should throw NotFoundError if user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.updateUserStatus("bad-id", "INACTIVE"))
        .rejects.toThrow(NotFoundError);
    });

    it("should update and return the user with new status", async () => {
      const user = { id: "u1", name: "Test", email: "t@t.com", role: "ANALYST", status: "ACTIVE" };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue({ ...user, status: "INACTIVE" });

      const result = await userService.updateUserStatus("u1", "INACTIVE");

      expect(result.status).toBe("INACTIVE");
    });
  });

  describe("getAnalystList", () => {
    it("should return only ANALYST users", async () => {
      const analysts = [
        { id: "a1", name: "Analyst 1", email: "a1@t.com", role: "ANALYST", status: "ACTIVE" },
      ];
      mockPrisma.user.findMany.mockResolvedValue(analysts);

      const result = await userService.getAnalystList();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: "ANALYST" },
      });
      expect(result).toHaveLength(1);
    });

    it("should filter analysts by status when provided", async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      await userService.getAnalystList("INACTIVE");

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { role: "ANALYST", status: "INACTIVE" },
      });
    });
  });
});
