import * as dashboardService from "./dashboard.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(req.user.sub, req.user.role);
  res.status(200).json({ success: true, data: summary });
});
