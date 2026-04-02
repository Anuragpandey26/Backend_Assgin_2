import * as auditService from "./audit.service.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

/**
 * Controller to fetch audit logs for admin review.
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const logs = await auditService.getLogs(req.query);
  res.status(200).json({
    success: true,
    data: logs,
  });
});
