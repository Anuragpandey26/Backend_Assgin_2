import "../mocks/prisma.mock.js";
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { mockPrisma } from "../mocks/prisma.mock.js";
import bcrypt from "bcryptjs";

// Mock the bcryptjs compare method
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}));

// Mock audit entries
vi.mock("../../modules/audit/audit.service.js", () => ({
  createLog: vi.fn().mockResolvedValue(true),
}));

describe("Auth Endpoints (Integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should return 400 if validation fails (short password)", async () => {
      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Test",
          email: "test@example.com",
          password: "123", // Too short (min 6)
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 201 if signup is successful", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        name: "Test",
        email: "test@example.com",
        role: "ADMIN",
        status: "ACTIVE",
      });

      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "Test",
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("test@example.com");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should return 200 and tokens if credentials are valid", async () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        password: "hashed-password",
        role: "ADMIN",
        status: "ACTIVE",
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      
      // Mock refresh token generation
      mockPrisma.refreshToken.create.mockResolvedValue({
        tokenHash: "hashed-token",
        userId: user.id,
      });

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "test@example.com",
          password: "password123",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });
  });
});
