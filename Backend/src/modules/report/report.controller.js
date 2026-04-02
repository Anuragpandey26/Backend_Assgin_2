import * as reportService from "./report.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";
import { BadRequestError } from "../../utils/http-errors.util.js";

export const exportCsv = asyncHandler(async (req, res) => {
  const csv = await reportService.exportCsv(req.user.sub, req.user.role);
  res.header("Content-Type", "text/csv");
  res.attachment(`financial-report-${new Date().toISOString()}.csv`);
  res.send(csv);
});

export const exportPdf = asyncHandler(async (req, res) => {
  res.header("Content-Type", "application/pdf");
  res.attachment(`financial-report-${new Date().toISOString()}.pdf`);
  await reportService.exportPdf(req.user.sub, req.user.role, res);
});

export const importCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No CSV file uploaded");
  }

  const result = await reportService.importCsv(req.user.sub, req.file.buffer);
  res.status(200).json({ success: true, data: result });
});
