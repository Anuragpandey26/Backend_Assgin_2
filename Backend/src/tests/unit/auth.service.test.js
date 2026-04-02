import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../../modules/auth/auth.service.js";
import { mockPrisma } from "../mocks/prisma.mock.js";
import bcrypt from "bcryptjs";
import * as jwtUtils from "../../utils/jwt.utils.js";
import { UnauthorizedError, ConflictError } from "../../utils/http-errors.util.js";

// Mock dependencies
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

vi.mock("../../utils/jwt.utils.js", () => ({
  signAccessToken: vi.fn().mockReturnValue("access-token"),
  createRefreshTokenForUser: vi.fn().mockResolvedValue("refresh-token"),
  revokeRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

// Mock the audit service
vi.mock("../../modules/audit/audit.service.js", () => ({
  createLog: vi.fn().mockResolvedValue(true),
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signup", () => {
    it("should throw ConflictError if user already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-1" });

      await expect(authService.signup({ email: "test@example.com", name: "Test", password: "password" }))
        .rejects.toThrow(ConflictError);
    });

    it("should create a new user and return user response", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        name: "Test",
        role: "ADMIN",
        status: "ACTIVE",
      });

      const result = await authService.signup({ email: "test@example.com", name: "Test", password: "password" });

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(result.id).toBe("user-1");
      expect(result.email).toBe("test@example.com");
    });
  });

  describe("login", () => {
    it("should throw UnauthorizedError if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.login({ email: "test@example.com", password: "password" }))
        .rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if password does not match", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ 
        id: "user-1", 
        password: "hashed-password",
        status: "ACTIVE" 
      });
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login({ email: "test@example.com", password: "password" }))
        .rejects.toThrow(UnauthorizedError);
    });

    it("should return tokens and user response if login successful", async () => {
      const user = { 
        id: "user-1", 
        email: "test@example.com", 
        password: "hashed-password",
        role: "ADMIN",
        status: "ACTIVE" 
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login({ email: "test@example.com", password: "password" });

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(result.user.id).toBe("user-1");
    });
  });
});
