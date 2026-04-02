import * as userService from "./user.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json({ success: true, data: users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const userRole = await userService.updateUserRole(req.params.id, req.body.role);
  res.status(200).json({ success: true, data: userRole });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const userStatus = await userService.updateUserStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, data: userStatus });
});

export const getAnalysts = asyncHandler(async (req, res) => {
  const analysts = await userService.getAnalystList(req.query.status);
  res.status(200).json({ success: true, data: analysts });
});
