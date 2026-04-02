import { Router } from "express";
import { signup, login, refreshToken, logout, revokeAll } from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { signupSchema, loginSchema, refreshTokenSchema, logoutSchema } from "./auth.validator.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", validate(signupSchema), signup);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", validate(refreshTokenSchema), refreshToken);
authRouter.post("/logout", authMiddleware, validate(logoutSchema), logout);
authRouter.post("/revoke-all", authMiddleware, revokeAll);

export default authRouter;
