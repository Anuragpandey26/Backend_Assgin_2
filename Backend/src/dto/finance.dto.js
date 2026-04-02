/**
 * Finance Data Transfer Object
 * Formats financial records for client responses.
 */

export const toFinanceRecordResponse = (record) => {
  if (!record) return null;

  return {
    id: record.id,
    amount: record.amount,
    type: record.type,
    category: record.category,
    date: record.date,
    notes: record.notes,
    userId: record.userId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

export const toFinanceRecordList = (records, pagination) => {
  return {
    records: records.map(toFinanceRecordResponse),
    pagination: pagination || null,
  };
};
