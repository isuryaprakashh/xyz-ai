import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { dataService } from "../db/dataService.js";
import { logToolCall } from "../middleware/audit.js";

const router = Router();

// GET /api/timetable/my — Role-based auto-fetch
router.get("/my", auth, async (req, res) => {
  try {
    const user = req.user;
    const role = user.role;
    const userId = user.userId || user.id;

    if (role === "student") {
      const classId = user.classId || "c1";
      const timetable = await dataService.getTimetableForClass(classId);
      logToolCall({ userId, role, action: "get_timetable", target: classId, success: true });
      return res.json({ role, classId, timetable });
    }

    if (role === "parent") {
      const studentId = req.query.studentId || (user.studentIds && user.studentIds[0]) || "jeevan";
      const student = await dataService.getUser(studentId);
      const classId = student?.classId || "c1";
      const timetable = await dataService.getTimetableForClass(classId);
      logToolCall({ userId, role, action: "get_timetable", target: studentId, success: true });
      return res.json({ role, studentId, studentName: student?.name, classId, timetable });
    }

    if (role === "teacher") {
      const teacherSchedule = await dataService.getTimetableForTeacher(user.username || userId);
      logToolCall({ userId, role, action: "get_timetable", target: userId, success: true });
      return res.json({ role, teacherSchedule });
    }

    if (role === "principal" || role === "admin") {
      const all = await dataService.getAllTimetables();
      logToolCall({ userId, role, action: "get_timetable", target: "all_classes", success: true });
      return res.json({ role, timetables: all });
    }

    res.status(400).json({ error: "invalid_role" });
  } catch (err) {
    console.error("Timetable /my error:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// GET /api/timetable/class/:classId
router.get("/class/:classId", auth, async (req, res) => {
  try {
    const { classId } = req.params;
    const timetable = await dataService.getTimetableForClass(classId);
    if (!timetable) return res.status(404).json({ error: "timetable_not_found" });
    res.json({ timetable });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// GET /api/timetable/teacher/:teacherId
router.get("/teacher/:teacherId", auth, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacherSchedule = await dataService.getTimetableForTeacher(teacherId);
    res.json({ teacherSchedule });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// GET /api/timetable/all — Principal & Admin
router.get("/all", auth, requireRole("principal", "admin"), async (req, res) => {
  try {
    const timetables = await dataService.getAllTimetables();
    res.json({ timetables });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// PUT /api/timetable/class/:classId — Principal & Admin update timetable
router.put("/class/:classId", auth, requireRole("principal", "admin"), async (req, res) => {
  try {
    const { classId } = req.params;
    const { schedule } = req.body;
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({ error: "invalid_schedule_format" });
    }

    const updated = await dataService.updateTimetable(classId, schedule);
    logToolCall({
      userId: req.user.userId || req.user.id,
      role: req.user.role,
      action: "update_timetable",
      target: classId,
      success: true,
    });

    res.json({ success: true, timetable: updated });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

export default router;
