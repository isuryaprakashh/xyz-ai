import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { dataService } from "../db/dataService.js";
import { logToolCall } from "../middleware/audit.js";

const router = Router();

// POST /api/escalation/request
router.post("/request", auth, async (req, res) => {
  const { targetRole = "teacher", studentId, reason, priority = "medium" } = req.body;

  if (!reason) {
    return res.status(400).json({ error: "missing_fields", message: "Reason for escalation is required." });
  }

  const requesterId = req.user.userId || req.user.id;
  const role = req.user.role;

  const ticket = await dataService.createEscalation({
    requesterId,
    role,
    targetRole,
    studentId: studentId || (role === "student" ? requesterId : req.user.studentIds?.[0]),
    reason,
    priority,
  });

  logToolCall({
    userId: requesterId,
    role,
    action: "escalate",
    target: targetRole,
    success: true,
    details: `ticket ${ticket.ticketId}`,
  });

  res.json({
    ticketId: ticket.ticketId,
    status: ticket.status,
    message: `Escalation ticket #${ticket.ticketId} created successfully.`,
  });
});

// GET /api/escalation/list
router.get("/list", auth, async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId || req.user.id;
    let query = {};

    if (role === "student" || role === "parent") {
      query.requesterId = userId;
    } else if (role === "teacher") {
      query.targetRole = "teacher";
    }

    const tickets = await dataService.getEscalations(query);
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// PATCH /api/escalation/:ticketId/status
router.patch("/:ticketId/status", auth, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "missing_status" });

  try {
    const updated = await dataService.updateEscalationStatus(req.params.ticketId, status);
    if (!updated) return res.status(404).json({ error: "ticket_not_found" });

    logToolCall({
      userId: req.user.userId || req.user.id,
      role: req.user.role,
      action: "escalate_status_update",
      target: req.params.ticketId,
      success: true,
      details: status,
    });

    res.json({ success: true, ticket: updated });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

export default router;