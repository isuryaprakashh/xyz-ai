const users = {
  s1: { id: "s1", username: "Rahul", name: "Rahul Sharma", role: "student", language: "en", classId: "c1" },
  s2: { id: "s2", username: "Priya", name: "Priya Patel", role: "student", language: "en", classId: "c1" },
  s3: { id: "s3", username: "Aarav", name: "Aarav Singh", role: "student", language: "hi", classId: "c2" },
  s4: { id: "s4", username: "Ananya", name: "Ananya Roy", role: "student", language: "ta", classId: "c1" },
  p1: { id: "p1", username: "Meera", name: "Meera Sharma", role: "parent", language: "en", studentIds: ["s1"] },
  p2: { id: "p2", username: "Arjun", name: "Arjun Patel", role: "parent", language: "en", studentIds: ["s2"] },
  t1: { id: "t1", username: "AnanyaS", name: "Ananya Sharma", role: "teacher", language: "en", classIds: ["c1"] },
  m1: { id: "m1", username: "Rajesh", name: "Rajesh Kumar", role: "principal", language: "en" }
};

const classes = {
  c1: { id: "c1", name: "Class 8A", teacherId: "t1", studentIds: ["s1", "s2", "s4"] },
  c2: { id: "c2", name: "Class 9B", teacherId: "t1", studentIds: ["s3"] }
};

// Hardcoded attendance percentages (baseline ~90% present).
// Ceiling: upgrade to seed.js mulberry32 generation when real data is needed.
// Upgrade path: replace hardcoded object with import { attendance } from "../data/seed.js"
const attendance = {
  s1: { percentage: "91.2", records: [] },
  s2: { percentage: "87.4", records: [] },
  s3: { percentage: "94.8", records: [] },
  s4: { percentage: "89.6", records: [] }
};

// Hardcoded parent-student mapping.
// Ceiling: support unlimited mappings when real database is integrated.
// Upgrade path: load from database; current ceiling is 2 parent-student pairs.
const parentStudentMap = {
  p1: ["s1"],
  p2: ["s2"]
};

// Hardcoded teacher-class mapping.
// Ceiling: teacher teaches all classes when roster expands.
// Upgrade path: load from database; current mapping covers 2 classes.
const teacherClassMap = {
  t1: ["c1", "c2"]
};

export { users, classes, attendance, parentStudentMap, teacherClassMap };