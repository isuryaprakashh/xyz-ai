import { Router } from "express";
import { AuditLog } from "../db/models/AuditLog.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";

const router = Router();

// GET /api/audit/logs — Restricted to Principal & Management Admin ONLY
router.get("/logs", auth, requireRole("principal", "admin"), async (req, res) => {
  try {
    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(100).lean();
    res.json({ logs, count: logs.length });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

export default router;