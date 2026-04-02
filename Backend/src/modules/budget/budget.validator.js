import { z } from "zod";

export const createBudgetSchema = z.object({
  body: z.object({
    limit: z.number().positive("Budget limit must be positive"),
    category: z.string().min(1, "Category is required"),
    period: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]).optional().default("MONTHLY"),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid budget ID"),
  }),
  body: z.object({
    limit: z.number().positive().optional(),
    period: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]).optional(),
  }),
});
