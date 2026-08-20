import { AuditLog } from "../db/models/AuditLog.js";
import { isDbConnected } from "../db/connection.js";

export async function logToolCall({ userId, role, action, target = "", success = true, details = "", ip = "" }) {
  try {
    if (isDbConnected()) {
      await AuditLog.create({
        userId: userId || "anonymous",
        role: role || "unknown",
        action,
        target,
        success,
        details,
        ip,
        timestamp: new Date(),
      });
    }
  } catch (err) {
    console.error("Audit log error:", err.message);
  }
}