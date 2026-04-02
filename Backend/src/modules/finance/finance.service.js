import { prisma } from "../../db/db.js";
import { NotFoundError, UnauthorizedError } from "../../utils/http-errors.util.js";

import { toFinanceRecordResponse, toFinanceRecordList } from "../../dto/finance.dto.js";
import { createLog as auditLog } from "../audit/audit.service.js";

export const createRecord = async (userId, data) => {
  const record = await prisma.financialRecord.create({
    data: {
      ...data,
      userId,
    },
  });

  // Budget Awareness - Industry Level Feature
  if (data.type === "EXPENSE") {
    const budget = await prisma.budget.findUnique({
      where: {
        userId_category_period: {
          userId,
          category: data.category,
          period: "MONTHLY",
        },
      },
    });

    if (budget) {
      const expenses = await prisma.financialRecord.aggregate({
        where: {
          userId,
          category: data.category,
          type: "EXPENSE",
          isDeleted: false,
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { amount: true },
      });

      const totalSpent = expenses._sum.amount || 0;
      if (totalSpent >= budget.limit) {
        return {
          ...toFinanceRecordResponse(record),
          alert: `Budget exceeded for ${data.category}! Limit: ${budget.limit}, Spent: ${totalSpent}`,
        };
      } else if (totalSpent >= budget.limit * 0.8) {
        return {
          ...toFinanceRecordResponse(record),
          alert: `Warning: You have reached 80% of your budget for ${data.category}.`,
        };
      }
    }
  }

  // Log the creation action
  await auditLog(userId, "CREATE_RECORD", record.id, { category: data.category });

  return toFinanceRecordResponse(record);
};

export const getRecords = async (userId, userRole, query) => {
  const { page, limit, startDate, endDate, minAmount, maxAmount, type, category, paymentMethod, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false,
    ...(userRole !== "ADMIN" && { userId }),
    ...(startDate && endDate && {
      date: { gte: new Date(startDate), lte: new Date(endDate) },
    }),
    ...(minAmount !== undefined && { amount: { gte: minAmount } }),
    ...(maxAmount !== undefined && { amount: { lte: maxAmount } }),
    ...(type && { type }),
    ...(category && { category: { contains: category, mode: "insensitive" } }),
    ...(paymentMethod && { paymentMethod: { contains: paymentMethod, mode: "insensitive" } }),
    ...(search && {
      OR: [
        { category: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { paymentMethod: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  const pagination = {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };

  return toFinanceRecordList(records, pagination);
};

export const updateRecord = async (recordId, userId, userRole, data) => {
  const record = await prisma.financialRecord.findUnique({
    where: { id: recordId },
  });

  if (!record || record.isDeleted) throw new NotFoundError("Record not found");
  
  if (userRole !== "ADMIN" && record.userId !== userId) {
    throw new UnauthorizedError("Insufficient permissions to update this record");
  }

  const updatedRecord = await prisma.financialRecord.update({
    where: { id: recordId },
    data,
  });

  // Log the update action
  await auditLog(userId, "UPDATE_RECORD", recordId, { updatedFields: Object.keys(data) });

  return toFinanceRecordResponse(updatedRecord);
};

export const deleteRecord = async (recordId, userId, userRole) => {
  const record = await prisma.financialRecord.findUnique({
    where: { id: recordId },
  });

  if (!record || record.isDeleted) throw new NotFoundError("Record not found");

  if (userRole !== "ADMIN" && record.userId !== userId) {
    throw new UnauthorizedError("Insufficient permissions to delete this record");
  }

  const deletedRecord = await prisma.financialRecord.update({
    where: { id: recordId },
    data: { isDeleted: true },
  });

  // Log the deletion action
  await auditLog(userId, "DELETE_RECORD", recordId);

  return toFinanceRecordResponse(deletedRecord);
};
