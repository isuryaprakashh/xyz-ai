import { Router } from "express";
import { AuditLog } from "../db/models/AuditLog.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

// GET /api/audit/logs — Principal & Admin only (or authenticated users viewing their logs)
router.get("/logs", auth, async (req, res) => {
  try {
    const query = req.user.role === "principal" || req.user.role === "admin" ? {} : { userId: req.user.userId || req.user.id };
    const logs = await AuditLog.find(query).sort({ timestamp: -1 }).limit(100).lean();
    res.json({ logs, count: logs.length });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

export default router;