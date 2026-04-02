import { prisma } from "../../db/db.js";
import { generateCsv } from "../../utils/csv.util.js";
import { generatePdfSummary } from "../../utils/pdf.util.js";
import { getSummary } from "../dashboard/dashboard.service.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

export const exportCsv = async (userId, userRole) => {
  const records = await prisma.financialRecord.findMany({
    where: { 
      userId: userRole === "ADMIN" ? undefined : userId,
      isDeleted: false 
    },
    orderBy: { date: "desc" },
  });

  const fields = ["date", "type", "category", "amount", "currency", "paymentMethod", "notes"];
  return generateCsv(records, fields);
};

export const exportPdf = async (userId, userRole, res) => {
  const summary = await getSummary(userId, userRole);
  return generatePdfSummary(res, summary, `Intelligence Report - ${userRole}`);
};

export const importCsv = async (userId, csvBuffer) => {
  const records = [];
  const stream = Readable.from(csvBuffer);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        records.push({
          amount: parseFloat(row.amount),
          type: row.type.toUpperCase(),
          category: row.category,
          currency: row.currency || "USD",
          paymentMethod: row.paymentMethod || "Cash",
          date: new Date(row.date),
          notes: row.notes || "",
          userId,
        });
      })
      .on("end", async () => {
        try {
          const result = await prisma.financialRecord.createMany({ data: records });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => reject(err));
  });
};
