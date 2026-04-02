import { rateLimit } from "express-rate-limit";

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: false, // disable X-RateLimit-* headers
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
