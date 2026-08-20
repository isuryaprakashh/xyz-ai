import { dataService } from "../db/dataService.js";

export const rolePermissions = {
  get_own_attendance: ["student"],
  get_child_attendance: ["parent"],
  mark_attendance: ["teacher"],
  get_school_attendance_analytics: ["principal", "admin"],
  escalate: ["student", "parent"],
};

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "unauthorized", message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "forbidden",
        message: `Forbidden: Role '${req.user.role}' cannot perform this action. Required: ${roles.join(", ")}`,
      });
    }
    next();
  };
}

// Ownership check: Parent can only access their linked children
export async function checkParentOwnership(studentId, parentUser) {
  if (!parentUser || parentUser.role !== "parent") return false;
  const parentStudentIds = parentUser.studentIds || [];
  return parentStudentIds.includes(studentId);
}

// Teacher check: Teacher can only mark attendance for classes they manage
export async function checkTeacherClass(studentId, teacherUser) {
  if (!teacherUser || teacherUser.role !== "teacher") return false;
  const student = await dataService.getUser(studentId);
  if (!student || !student.classId) return false;
  const teacherClassIds = teacherUser.classIds || [];
  return teacherClassIds.includes(student.classId);
}