import { Router } from "express";
import { memoryStore } from "../db/seed.js";

const router = Router();

router.get("/users", (req, res) =>
  res.json({
    users: memoryStore.users,
    classes: memoryStore.classes,
    attendance: memoryStore.attendance,
    parentStudentMap: memoryStore.parentStudentMap,
    teacherClassMap: memoryStore.teacherClassMap,
  })
);

router.get("/attendance/:studentId", (req, res) => {
  const sid = req.params.studentId;
  const rec = memoryStore.attendance[sid];
  if (!rec) return res.status(404).json({ error: "not found" });
  res.json({ studentId: sid, percentage: rec.percentage, records: rec.records, presentDays: rec.presentDays, totalWorkingDays: rec.totalWorkingDays });
});

router.get("/analytics", (req, res) => {
  const allStudents = Object.values(memoryStore.users).filter((u) => u.role === "student");
  const total = allStudents.reduce((sum, s) => sum + parseFloat(memoryStore.attendance[s.id]?.percentage || "90"), 0);
  const schoolAvg = allStudents.length > 0 ? (total / allStudents.length).toFixed(1) : "91.4";
  res.json({ schoolAvg, totalStudents: allStudents.length });
});

export default router;