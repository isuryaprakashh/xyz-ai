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

// GET /api/attendance/class/:classId — Fetch student roster for a specific classroom
router.get("/class/:classId", auth, async (req, res) => {
  const { classId } = req.params;
  const reqUser = req.user;

  // Authorization: teacher must be assigned to class, or principal/admin
  if (reqUser.role === "teacher") {
    const userClassIds = reqUser.classIds || [];
    if (!userClassIds.includes(classId)) {
      logToolCall({ userId: reqUser.userId || reqUser.id, role: reqUser.role, action: "get_class_roster", target: classId, success: false });
      return res.status(403).json({ error: "forbidden", message: `You are not assigned to teach ${classId.toUpperCase()}.` });
    }
  } else if (reqUser.role !== "principal" && reqUser.role !== "admin") {
    return res.status(403).json({ error: "forbidden", message: "Unauthorized role for class roster." });
  }

  const roster = await dataService.getClassRoster(classId);
  const classInfo = await dataService.getClass(classId);

  logToolCall({ userId: reqUser.userId || reqUser.id, role: reqUser.role, action: "get_class_roster", target: classId, success: true });

  res.json({
    classId,
    className: classInfo?.name || classId.toUpperCase(),
    roster,
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

// POST /api/attendance/mark — Single Student Mark (Teacher & Principal)
router.post("/mark", auth, async (req, res) => {
  const { studentId, date = "today", status = "present" } = req.body;
  const reqUser = req.user;

  if (reqUser.role !== "teacher" && reqUser.role !== "principal" && reqUser.role !== "admin") {
    return res.status(403).json({ error: "forbidden", message: "Only faculty and administration can mark attendance." });
  }

  if (!studentId || !status) {
    return res.status(400).json({ error: "missing_fields", message: "studentId and status are required." });
  }

  const student = await dataService.getUser(studentId);
  if (!student) return res.status(404).json({ error: "student_not_found", message: "Student not found." });

  if (reqUser.role === "teacher") {
    const hasClassPermission = await checkTeacherClass(studentId, reqUser);
    if (!hasClassPermission) {
      logToolCall({ userId: reqUser.userId || reqUser.id, role: "teacher", action: "mark_attendance", target: studentId, success: false });
      return res.status(403).json({
        error: "forbidden",
        message: `You can only mark attendance for students in your assigned classes. ${student.name} is in class ${student.classId}.`,
      });
    }
  }

  const result = await dataService.markAttendance({
    studentId,
    date,
    status,
    markedBy: reqUser.userId || reqUser.id,
  });

  logToolCall({
    userId: reqUser.userId || reqUser.id,
    role: reqUser.role,
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

// POST /api/attendance/mark-class — Bulk Class Attendance Posting (Teacher & Principal)
router.post("/mark-class", auth, async (req, res) => {
  const { classId, date = "today", studentStatuses = [] } = req.body;
  const reqUser = req.user;

  if (reqUser.role !== "teacher" && reqUser.role !== "principal" && reqUser.role !== "admin") {
    return res.status(403).json({ error: "forbidden", message: "Only faculty and administration can mark class attendance." });
  }

  if (!classId || !studentStatuses.length) {
    return res.status(400).json({ error: "missing_fields", message: "classId and studentStatuses are required." });
  }

  if (reqUser.role === "teacher") {
    const userClassIds = reqUser.classIds || [];
    if (!userClassIds.includes(classId)) {
      logToolCall({ userId: reqUser.userId || reqUser.id, role: "teacher", action: "mark_class_attendance", target: classId, success: false });
      return res.status(403).json({ error: "forbidden", message: `You are not assigned to mark attendance for ${classId.toUpperCase()}.` });
    }
  }

  const result = await dataService.markClassAttendance({
    classId,
    date,
    studentStatuses,
    markedBy: reqUser.userId || reqUser.id,
  });

  logToolCall({
    userId: reqUser.userId || reqUser.id,
    role: reqUser.role,
    action: "mark_class_attendance",
    target: classId,
    success: true,
    details: `${date}: ${studentStatuses.length} students marked`,
  });

  res.json({ success: true, result });
});

export default router;