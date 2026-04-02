import bcrypt from "bcryptjs";
import { prisma } from "../../db/db.js";
import { 
  signAccessToken, 
  createRefreshTokenForUser, 
  consumeRefreshToken,
  revokeRefreshToken,
  revokeAllTokensForUser,
  blacklistAccessToken,
  verifyAccessToken
} from "../../utils/jwt.utils.js";
import { 
  BadRequestError, 
  UnauthorizedError 
} from "../../utils/http-errors.util.js";
import { toUserResponse } from "../../dto/user.dto.js";
import { createLog as auditLog } from "../audit/audit.service.js";

export const signup = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new BadRequestError("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Log the signup action
  await auditLog(user.id, "SIGNUP", user.id, { email: user.email });

  return toUserResponse(user);
};

export const login = async (credentials) => {
  const { email, password } = credentials;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.status === "INACTIVE") {
    throw new UnauthorizedError("Invalid credentials or account inactive");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = await createRefreshTokenForUser(user.id);

  // Log the login action
  await auditLog(user.id, "LOGIN", user.id, { email: user.email });

  return {
    user: toUserResponse(user),
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken) => {
  const userId = await consumeRefreshToken(refreshToken);
  if (!userId) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.status === "INACTIVE") {
    throw new UnauthorizedError("User no longer active");
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const newRefreshToken = await createRefreshTokenForUser(user.id);

  return { accessToken, refreshToken: newRefreshToken };
};

export const logout = async (accessToken, refreshToken) => {
  // 1. Blacklist access token if provided
  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);
      if (decoded && decoded.jti) {
        await blacklistAccessToken(decoded.jti, decoded.exp);
      }
    } catch (error) {
      // If token is already expired or invalid, we don't necessarily need to blacklist it
      // but we should still try to revoke the refresh token.
    }
  }

  // 2. Revoke refresh token
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
    
    // Log the logout action if we have a valid access token
    try {
      const decoded = verifyAccessToken(accessToken);
      if (decoded && decoded.sub) {
        await auditLog(decoded.sub, "LOGOUT", decoded.sub, { refreshToken });
      }
    } catch (error) {
      // If access token is invalid/expired, we still log that a logout was attempted
    }
  }
};

export const revokeAll = async (userId) => {
  await revokeAllTokensForUser(userId);
};
