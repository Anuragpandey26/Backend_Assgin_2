import PDFDocument from "pdfkit";

/**
 * Standard PDF Generation Utility
 * Creates a professional financial summary in PDF format.
 */

export const generatePdfSummary = (res, data, title = "Financial Summary") => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream output directly to response for fast downloads
  doc.pipe(res);

  // Header Title
  doc.fontSize(20).text(title, { align: "center" });
  doc.moveDown();

  // Summary Metrics Table
  doc.fontSize(14).text("Summary Metrics", { underline: true });
  doc.fontSize(12).text(`Total Income: ${data.totalIncome}`);
  doc.fontSize(12).text(`Total Expenses: ${data.totalExpenses}`);
  doc.fontSize(12).text(`Current Balance: ${data.netBalance}`);
  doc.moveDown();

  // Category Breakdown
  doc.fontSize(14).text("Category Breakdown", { underline: true });
  Object.entries(data.categoryWise).forEach(([category, amount]) => {
    doc.fontSize(12).text(`${category}: ${amount}`);
  });
  doc.moveDown();

  // Recent Transactions
  doc.fontSize(14).text("Recent Transactions", { underline: true });
  data.recentActivity.forEach((record) => {
    doc.fontSize(10).text(`${record.date.toISOString().split("T")[0]} | ${record.type} | ${record.category} | ${record.amount} ${record.currency}`);
  });

  // Footer Message
  doc.fontSize(10).text(`Report generated on ${new Date().toLocaleString()}`, 50, 700, { align: "center" });

  doc.end();
};
