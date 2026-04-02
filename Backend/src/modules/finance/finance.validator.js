import { z } from "zod";

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().length(3).optional().default("USD"),
    type: z.enum(["INCOME", "EXPENSE"]),
    category: z.string().min(1, "Category is required"),
    paymentMethod: z.string().optional().default("Cash"),
    date: z.string().datetime().optional().transform(v => v ? new Date(v) : new Date()),
    notes: z.string().optional(),
  }),
});

export const updateRecordSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid record ID"),
  }),
  body: z.object({
    amount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z.string().min(1).optional(),
    paymentMethod: z.string().optional(),
    date: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
});

export const getRecordsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(v => parseInt(v, 10) || 1),
    limit: z.string().optional().transform(v => parseInt(v, 10) || 10),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    minAmount: z.string().optional().transform(v => parseFloat(v) || undefined),
    maxAmount: z.string().optional().transform(v => parseFloat(v) || undefined),
    type: z.enum(["INCOME", "EXPENSE"]).optional(),
    category: z.string().optional(),
    paymentMethod: z.string().optional(),
    search: z.string().optional(),
  }),
});
