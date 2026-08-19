import { users, classes, attendance, parentStudentMap, teacherClassMap } from "../data/seed.js";

export function initApp(app) {
  // Seed data routes available in demo mode
  app.get("/api/demo/users", (req, res) => res.json({ users, classes, attendance, parentStudentMap, teacherClassMap }));
}