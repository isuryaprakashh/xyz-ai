const users = {
  // Students
  s1: { id: "s1", username: "Rahul", name: "Rahul Sharma", role: "student", language: "en", classId: "c1" },
  s2: { id: "s2", username: "Priya", name: "Priya Patel", role: "student", language: "en", classId: "c1" },
  s3: { id: "s3", username: "Aarav", name: "Aarav Singh", role: "student", language: "hi", classId: "c2" },
  s4: { id: "s4", username: "Ananya", name: "Ananya Roy", role: "student", language: "ta", classId: "c1" },
  s5: { id: "s5", username: "Rohan", name: "Rohan Gupta", role: "student", language: "hi", classId: "c3" },
  s6: { id: "s6", username: "Sneha", name: "Sneha Reddy", role: "student", language: "te", classId: "c4" },
  s7: { id: "s7", username: "Kabir", name: "Kabir Verma", role: "student", language: "en", classId: "c5" },
  s8: { id: "s8", username: "Diya", name: "Diya Mukherjee", role: "student", language: "bn", classId: "c5" },
  s9: { id: "s9", username: "Vikram", name: "Vikram Malhotra", role: "student", language: "pa", classId: "c2" },
  s10: { id: "s10", username: "Ishaan", name: "Ishaan Joshi", role: "student", language: "mr", classId: "c3" },

  // Parents
  p1: { id: "p1", username: "Meera", name: "Meera Sharma", role: "parent", language: "en", studentIds: ["s1"] },
  p2: { id: "p2", username: "Arjun", name: "Arjun Patel", role: "parent", language: "en", studentIds: ["s2"] },
  p3: { id: "p3", username: "Sunita", name: "Sunita Singh", role: "parent", language: "hi", studentIds: ["s3"] },
  p4: { id: "p4", username: "Ramesh", name: "Ramesh Gupta", role: "parent", language: "hi", studentIds: ["s5", "s10"] },
  p5: { id: "p5", username: "Anita", name: "Anita Verma", role: "parent", language: "en", studentIds: ["s7"] },

  // Teachers
  t1: { id: "t1", username: "AnanyaS", name: "Ananya Sharma", role: "teacher", language: "en", classIds: ["c1", "c2"] },
  t2: { id: "t2", username: "VikramRoy", name: "Vikramaditya Roy", role: "teacher", language: "en", classIds: ["c4", "c5"] },
  t3: { id: "t3", username: "NehaK", name: "Neha Kulkarni", role: "teacher", language: "mr", classIds: ["c3"] },

  // Management / Principals
  m1: { id: "m1", username: "Rajesh", name: "Rajesh Kumar", role: "principal", language: "en" },
  m2: { id: "m2", username: "Kavita", name: "Dr. Kavita Menon", role: "principal", language: "en" }
};

const classes = {
  c1: { id: "c1", name: "Class 8A", teacherId: "t1", teacherName: "Ananya Sharma", studentIds: ["s1", "s2", "s4"] },
  c2: { id: "c2", name: "Class 9B", teacherId: "t1", teacherName: "Ananya Sharma", studentIds: ["s3", "s9"] },
  c3: { id: "c3", name: "Class 8B", teacherId: "t3", teacherName: "Neha Kulkarni", studentIds: ["s5", "s10"] },
  c4: { id: "c4", name: "Class 9A", teacherId: "t2", teacherName: "Vikramaditya Roy", studentIds: ["s6"] },
  c5: { id: "c5", name: "Class 10A", teacherId: "t2", teacherName: "Vikramaditya Roy", studentIds: ["s7", "s8"] }
};

const attendance = {
  s1: { percentage: "91.2", totalWorkingDays: 90, presentDays: 82, records: [] },
  s2: { percentage: "87.4", totalWorkingDays: 90, presentDays: 78, records: [] },
  s3: { percentage: "94.8", totalWorkingDays: 90, presentDays: 85, records: [] },
  s4: { percentage: "89.6", totalWorkingDays: 90, presentDays: 80, records: [] },
  s5: { percentage: "92.5", totalWorkingDays: 90, presentDays: 83, records: [] },
  s6: { percentage: "96.0", totalWorkingDays: 90, presentDays: 86, records: [] },
  s7: { percentage: "78.4", totalWorkingDays: 90, presentDays: 70, records: [] },
  s8: { percentage: "95.1", totalWorkingDays: 90, presentDays: 85, records: [] },
  s9: { percentage: "83.2", totalWorkingDays: 90, presentDays: 74, records: [] },
  s10: { percentage: "88.0", totalWorkingDays: 90, presentDays: 79, records: [] }
};

const parentStudentMap = {
  p1: ["s1"],
  p2: ["s2"],
  p3: ["s3"],
  p4: ["s5", "s10"],
  p5: ["s7"]
};

const teacherClassMap = {
  t1: ["c1", "c2"],
  t2: ["c4", "c5"],
  t3: ["c3"]
};

export { users, classes, attendance, parentStudentMap, teacherClassMap };