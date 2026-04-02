import { verifyAccessToken, isAccessTokenBlacklisted } from "../utils/jwt.utils.js";
import { UnauthorizedError } from "../utils/http-errors.util.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization header missing or invalid");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const isBlacklisted = await isAccessTokenBlacklisted(decoded.jti);
    if (isBlacklisted) {
      throw new UnauthorizedError("Token is blacklisted");
    }

    req.user = decoded; // { sub: userId, role: userRole } - assuming we add role to payload
    next();
  } catch (error) {
    next(error);
  }
};
