import { z } from "zod";

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
  body: z.object({
    role: z.enum(["ADMIN", "ANALYST", "VIEWER"], {
      errorMap: () => ({ message: "Invalid role. Must be ADMIN, ANALYST, or VIEWER" }),
    }),
  }),
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID"),
  }),
  body: z.object({
    status: z.enum(["ACTIVE", "INACTIVE"], {
      errorMap: () => ({ message: "Invalid status. Must be ACTIVE or INACTIVE" }),
    }),
  }),
});
