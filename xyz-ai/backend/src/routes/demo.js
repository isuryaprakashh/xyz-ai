import { Router } from "express";
import { attendance, parentStudentMap, teacherClassMap, users, classes } from "../data/seed.js";

const router = Router();

router.get("/users", (req, res) => res.json({ users, classes, attendance, parentStudentMap, teacherClassMap }));
router.get("/attendance/:studentId", (req, res) => {
  const sid = req.params.studentId;
  const rec = attendance[sid];
  if (!rec) return res.status(404).json({ error: "not found" });
  res.json({ studentId: sid, percentage: rec.percentage, records: rec.records });
});
router.get("/analytics", (req, res) => {
  // Return a simple analytics summary for demo
  const allStudents = Object.values(users).filter(u => u.role === "student");
  const schoolAvg = 89.5; // placeholder
  res.json({ schoolAvg });
});

export default router;