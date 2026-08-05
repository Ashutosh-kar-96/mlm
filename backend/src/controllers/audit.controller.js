import { listAudit } from "../services/audit.service.js";
import { success } from "../utils/apiResponse.js";

export const auditLogs = async (req, res, next) => {
  try {
    success(res, await listAudit(req.query));
  } catch (err) {
    next(err);
  }
};
