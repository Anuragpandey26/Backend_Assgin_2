import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authService from "../../modules/auth/auth.service.js";
import { mockPrisma } from "../mocks/prisma.mock.js";
import * as jwtUtils from "../../utils/jwt.utils.js";
import { UnauthorizedError } from "../../utils/http-errors.util.js";

// Mock jwt utils
vi.mock("../../utils/jwt.utils.js", () => ({
  signAccessToken: vi.fn().mockReturnValue("access-token"),
  createRefreshTokenForUser: vi.fn().mockResolvedValue("new-refresh-token"),
  consumeRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
  revokeAllTokensForUser: vi.fn(),
  verifyAccessToken: vi.fn(),
  blacklistAccessToken: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn(),
  },
}));

vi.mock("../../modules/audit/audit.service.js", () => ({
  createLog: vi.fn().mockResolvedValue(true),
}));

describe("authService - additional coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("refresh", () => {
    it("should throw UnauthorizedError if refresh token is invalid", async () => {
      jwtUtils.consumeRefreshToken.mockResolvedValue(null);

      await expect(authService.refresh("bad-token"))
        .rejects.toThrow(UnauthorizedError);
    });

    it("should throw UnauthorizedError if user is INACTIVE", async () => {
      jwtUtils.consumeRefreshToken.mockResolvedValue("user-1");
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1", status: "INACTIVE", role: "VIEWER",
      });

      await expect(authService.refresh("valid-token"))
        .rejects.toThrow(UnauthorizedError);
    });

    it("should return new tokens when refresh is valid", async () => {
      jwtUtils.consumeRefreshToken.mockResolvedValue("user-1");
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1", status: "ACTIVE", role: "ADMIN",
      });

      const result = await authService.refresh("valid-token");

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("new-refresh-token");
      expect(jwtUtils.signAccessToken).toHaveBeenCalledWith({ sub: "user-1", role: "ADMIN" });
    });
  });

  describe("logout", () => {
    it("should blacklist access token and revoke refresh token", async () => {
      jwtUtils.verifyAccessToken.mockReturnValue({ jti: "token-jti", exp: 999999, sub: "user-1" });

      await authService.logout("access-token", "refresh-token");

      expect(jwtUtils.blacklistAccessToken).toHaveBeenCalledWith("token-jti", 999999);
      expect(jwtUtils.revokeRefreshToken).toHaveBeenCalledWith("refresh-token");
    });

    it("should handle expired access token gracefully during logout", async () => {
      jwtUtils.verifyAccessToken.mockImplementation(() => {
        throw new Error("Token expired");
      });

      // Should not throw - logout should still proceed
      await expect(authService.logout("expired-token", "refresh-token")).resolves.not.toThrow();
      expect(jwtUtils.revokeRefreshToken).toHaveBeenCalledWith("refresh-token");
    });

    it("should handle logout with no refresh token", async () => {
      jwtUtils.verifyAccessToken.mockReturnValue({ jti: "jti", exp: 999, sub: "u1" });

      await authService.logout("access-token", null);

      expect(jwtUtils.blacklistAccessToken).toHaveBeenCalled();
      expect(jwtUtils.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe("revokeAll", () => {
    it("should revoke all tokens for a user", async () => {
      await authService.revokeAll("user-1");

      expect(jwtUtils.revokeAllTokensForUser).toHaveBeenCalledWith("user-1");
    });
  });
});
