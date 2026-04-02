import { signup as authSignup, login as authLogin, refresh as authRefresh, logout as authLogout, revokeAll as authRevokeAll } from "./auth.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

export const signup = asyncHandler(async (req, res) => {
  const user = await authSignup(req.body);
  res.status(201).json({
    success: true,
    data: user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authLogin(req.body);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const result = await authRefresh(req.body.refreshToken);
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.split(" ")[1];
  const { refreshToken } = req.body;

  await authLogout(accessToken, refreshToken);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export const revokeAll = asyncHandler(async (req, res) => {
  await authRevokeAll(req.user.sub);
  res.status(200).json({
    success: true,
    message: "All sessions revoked successfully",
  });
});
