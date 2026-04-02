import { prisma } from "../../db/db.js";
import { NotFoundError } from "../../utils/http-errors.util.js";

import { toUserList, toUserResponse } from "../../dto/user.dto.js";

export const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  return toUserList(users);
};

export const updateUserRole = async (userId, role) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return toUserResponse(updatedUser);
};

export const updateUserStatus = async (userId, status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  return toUserResponse(updatedUser);
};

/**
 * Admin only: Fetch a list of all analysts, optionally filtered by status.
 */
export const getAnalystList = async (status) => {
  const users = await prisma.user.findMany({
    where: {
      role: "ANALYST",
      ...(status && { status }),
    },
  });

  return toUserList(users);
};
