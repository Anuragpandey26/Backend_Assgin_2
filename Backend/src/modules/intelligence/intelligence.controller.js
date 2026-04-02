import * as intelligenceService from "./intelligence.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

export const getForecasting = asyncHandler(async (req, res) => {
  const forecasting = await intelligenceService.getForecasting(req.user.sub, req.user.role);
  res.status(200).json({ success: true, data: forecasting });
});
