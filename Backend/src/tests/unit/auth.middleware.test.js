import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import * as jwtUtils from "../../utils/jwt.utils.js";
import { UnauthorizedError } from "../../utils/http-errors.util.js";


// Mock the jwt.utils module
vi.mock("../../utils/jwt.utils.js", () => ({
  verifyAccessToken: vi.fn(),
  isAccessTokenBlacklisted: vi.fn(),
}));

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("should throw UnauthorizedError if Authorization header is missing", async () => {
    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(next.mock.calls[0][0].message).toBe("Authorization header missing or invalid");
  });

  it("should throw UnauthorizedError if token is invalid", async () => {
    req.headers.authorization = "Bearer invalid-token";
    jwtUtils.verifyAccessToken.mockReturnValue(null);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(next.mock.calls[0][0].message).toBe("Invalid or expired token");
  });

  it("should throw UnauthorizedError if token is blacklisted", async () => {
    req.headers.authorization = "Bearer blacklisted-token";
    const decoded = { sub: "user-1", jti: "token-jti" };
    jwtUtils.verifyAccessToken.mockReturnValue(decoded);
    jwtUtils.isAccessTokenBlacklisted.mockResolvedValue(true);

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    expect(next.mock.calls[0][0].message).toBe("Token is blacklisted");
  });

  it("should call next() and set req.user if token is valid and not blacklisted", async () => {
    req.headers.authorization = "Bearer valid-token";
    const decoded = { sub: "user-1", jti: "token-jti" };
    jwtUtils.verifyAccessToken.mockReturnValue(decoded);
    jwtUtils.isAccessTokenBlacklisted.mockResolvedValue(false);

    await authMiddleware(req, res, next);

    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalledWith();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });
});
