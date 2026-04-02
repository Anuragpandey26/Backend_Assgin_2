import * as financeService from "./finance.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

export const createRecord = asyncHandler(async (req, res) => {
  const record = await financeService.createRecord(req.user.sub, req.body);
  res.status(201).json({ success: true, data: record });
});

export const getRecords = asyncHandler(async (req, res) => {
  const records = await financeService.getRecords(req.user.sub, req.user.role, req.query);
  res.status(200).json({ success: true, data: records });
});

export const updateRecord = asyncHandler(async (req, res) => {
  const record = await financeService.updateRecord(req.params.id, req.user.sub, req.user.role, req.body);
  res.status(200).json({ success: true, data: record });
});

export const deleteRecord = asyncHandler(async (req, res) => {
  const result = await financeService.deleteRecord(req.params.id, req.user.sub, req.user.role);
  res.status(200).json({ success: true, message: "Record deleted successfully", data: result });
});
