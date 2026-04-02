import crypto from "crypto";
import { add } from "date-fns";
import { prisma } from "../db/db.js";
import jwt from "jsonwebtoken";

// /src/utils/jwt.utils.js

// Environment variables
// Validate JWT_SECRET at module load time
if (!process.env.JWT_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET is not defined in environment variables",
  );
}
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY ?? "15m";

const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY?.replace("d", "") || "30",
  10
);
const REFRESH_TOKEN_BYTES = 48;

/**
 * Creates a signed JWT access token for a given user ID.
 */
export function signAccessToken(payload) {
  const finalPayload = { 
    ...payload,
    jti: crypto.randomBytes(16).toString("hex") 
  };
  const options = { expiresIn: ACCESS_TOKEN_EXPIRY };
  return jwt.sign(finalPayload, JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT access token.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Creates a refresh token for a user and stores its hashed version in the DB.
 */
export async function createRefreshTokenForUser(userId) {
  const raw = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = add(new Date(), { days: REFRESH_TOKEN_EXPIRY_DAYS });

  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });

  return raw; // raw token (to send to client)
}

/**
 * Revokes all refresh tokens matching a given raw token.
 */
export async function revokeRefreshToken(rawToken) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

/**
 * Revokes ALL refresh tokens for a user.
 */
export async function revokeAllTokensForUser(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

/**
 * Blacklists an access token by its JTI.
 */
export async function blacklistAccessToken(jti, expiresAt) {
  await prisma.blacklistedToken.create({
    data: { jti, expiresAt: new Date(expiresAt * 1000) },
  });
}

/**
 * Checks if an access token is blacklisted by its JTI.
 */
export async function isAccessTokenBlacklisted(jti) {
  const blacklisted = await prisma.blacklistedToken.findUnique({
    where: { jti },
  });
  return !!blacklisted;
}

/**
 * Consumes a refresh token (verifies and revokes it).
 * Returns the associated user ID if valid, otherwise null.
 */
export async function consumeRefreshToken(rawToken) {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const db = await prisma.refreshToken.findFirst({
    where: { tokenHash, revoked: false },
  });

  if (!db) return null;
  if (db.expiresAt < new Date()) return null;

  // revoke it to prevent reuse
  await prisma.refreshToken.update({
    where: { id: db.id },
    data: { revoked: true },
  });

  return db.userId;
}
