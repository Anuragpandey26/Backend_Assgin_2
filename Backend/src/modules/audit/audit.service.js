import { prisma } from "../../db/db.js";

/**
 * Creates a new audit log entry.
 * @param {string} userId - ID of the user performing the action.
 * @param {string} action - Action performed (e.g., LOGIN, CREATE_RECORD).
 * @param {string} entityId - Optional ID of the affected resource.
 * @param {object} metadata - Optional additional context.
 */
export const createLog = async (userId, action, entityId = null, metadata = {}) => {
  try {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityId,
        metadata,
      },
    });
  } catch (error) {
    // We log and swallow errors here to ensure audit logging doesn't break the main flow,
    // though in a mission-critical app, you might want to handle this differently.
    console.error("Failed to create audit log:", error);
  }
};

/**
 * Fetches audit logs with filtering and pagination.
 */
export const getLogs = async (query = {}) => {
  const { userId, action, startDate, endDate, page = 1, limit = 50 } = query;
  const skip = (page - 1) * limit;

  return await prisma.auditLog.findMany({
    where: {
      ...(userId && { userId }),
      ...(action && { action }),
      ...(startDate && endDate && {
        createdAt: { gte: new Date(startDate), lte: new Date(endDate) },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });
};
