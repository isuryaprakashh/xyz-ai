import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole, checkParentOwnership, checkTeacherClass } from "../middleware/rbac.js";
import { dataService } from "../db/dataService.js";
import { logToolCall } from "../middleware/audit.js";

const router = Router();

// GET /api/attendance/student/:studentId — Student or Parent with ownership
router.get("/student/:studentId", auth, async (req, res) => {
  const studentId = req.params.studentId;
  const reqUser = req.user;

  // If student: can only fetch own
  if (reqUser.role === "student") {
    if (reqUser.userId !== studentId && reqUser.id !== studentId) {
      logToolCall({ userId: reqUser.userId || reqUser.id, role: reqUser.role, action: "get_own_attendance", target: studentId, success: false });
      return res.status(403).json({ error: "forbidden", message: "Students can only access their own attendance." });
    }
  } else if (reqUser.role === "parent") {
    const isOwner = await checkParentOwnership(studentId, reqUser);
    if (!isOwner) {
      logToolCall({ userId: reqUser.userId || reqUser.id, role: reqUser.role, action: "get_child_attendance", target: studentId, success: false });
      return res.status(403).json({ error: "forbidden", message: "You are only permitted to view your own child's records." });
    }
  } else if (reqUser.role !== "teacher" && reqUser.role !== "principal" && reqUser.role !== "admin") {
    return res.status(403).json({ error: "forbidden", message: "Unauthorized role for attendance access." });
  }

  const student = await dataService.getUser(studentId);
  if (!student) return res.status(404).json({ error: "student_not_found", message: "Student record not found." });

  const record = await dataService.getAttendance(studentId);
  if (!record) return res.status(404).json({ error: "attendance_data_not_found", message: "No attendance data found for student." });

  logToolCall({ userId: reqUser.userId || reqUser.id, role: reqUser.role, action: "get_attendance", target: studentId, success: true });

  res.json({
    studentId: student.userId || student.id,
    name: student.name,
    classId: student.classId,
    percentage: record.percentage,
    totalWorkingDays: record.totalWorkingDays,
    presentDays: record.presentDays,
    records: record.records,
  });
});

// GET /api/attendance/analytics — Principal & Admin only
router.get("/analytics", auth, requireRole("principal", "admin"), async (req, res) => {
  try {
    const analytics = await dataService.getSchoolAnalytics();
    logToolCall({ userId: req.user.userId || req.user.id, role: req.user.role, action: "get_school_attendance_analytics", target: "school", success: true });
    res.json(analytics);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// POST /api/attendance/mark — Teacher only
router.post("/mark", auth, requireRole("teacher"), async (req, res) => {
  const { studentId, date = "today", status = "present" } = req.body;
  if (!studentId || !status) {
    return res.status(400).json({ error: "missing_fields", message: "studentId and status are required." });
  }

  const student = await dataService.getUser(studentId);
  if (!student) return res.status(404).json({ error: "student_not_found", message: "Student not found." });

  const hasClassPermission = await checkTeacherClass(studentId, req.user);
  if (!hasClassPermission) {
    logToolCall({ userId: req.user.userId || req.user.id, role: "teacher", action: "mark_attendance", target: studentId, success: false });
    return res.status(403).json({
      error: "forbidden",
      message: `You can only mark attendance for students in your assigned classes. ${student.name} is in class ${student.classId}.`,
    });
  }

  const result = await dataService.markAttendance({
    studentId,
    date,
    status,
    markedBy: req.user.userId || req.user.id,
  });

  logToolCall({
    userId: req.user.userId || req.user.id,
    role: "teacher",
    action: "mark_attendance",
    target: studentId,
    success: true,
    details: `${date}:${status}`,
  });

  res.json({
    success: true,
    record: {
      ...result.record,
      studentName: student.name,
    },
  });
});

export default router;