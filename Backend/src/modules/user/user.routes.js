import { Router } from "express";
import * as userController from "./user.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { checkPermission } from "../../middlewares/role.middleware.js";
import { PERMISSIONS } from "../../config/permissions.config.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateUserRoleSchema, updateUserStatusSchema } from "./user.validator.js";

const userRouter = Router();

// PROTECT ALL USER ROUTES - REQUIRE USER_MANAGE PERMISSION
userRouter.use(authMiddleware, checkPermission(PERMISSIONS.USER_MANAGE));

userRouter.get("/", userController.getAllUsers);
userRouter.get("/analysts", userController.getAnalysts);
userRouter.patch("/:id/role", validate(updateUserRoleSchema), userController.updateUserRole);
userRouter.patch("/:id/status", validate(updateUserStatusSchema), userController.updateUserStatus);

export default userRouter;
