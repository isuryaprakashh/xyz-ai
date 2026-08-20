import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Attendance } from "./models/Attendance.js";
import { Escalation } from "./models/Escalation.js";
import { SchoolClass } from "./models/Class.js";
import { connectDB, isDbConnected } from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");

export const memoryStore = {
  users: {
    // Students
    s1: { id: "s1", userId: "s1", username: "Rahul", name: "Rahul Sharma", role: "student", language: "en", classId: "c1", studentIds: [], classIds: [] },
    s2: { id: "s2", userId: "s2", username: "Priya", name: "Priya Patel", role: "student", language: "en", classId: "c1", studentIds: [], classIds: [] },
    s3: { id: "s3", userId: "s3", username: "Aarav", name: "Aarav Singh", role: "student", language: "hi", classId: "c2", studentIds: [], classIds: [] },
    s4: { id: "s4", userId: "s4", username: "Ananya", name: "Ananya Roy", role: "student", language: "ta", classId: "c1", studentIds: [], classIds: [] },
    s5: { id: "s5", userId: "s5", username: "Rohan", name: "Rohan Gupta", role: "student", language: "hi", classId: "c3", studentIds: [], classIds: [] },
    s6: { id: "s6", userId: "s6", username: "Sneha", name: "Sneha Reddy", role: "student", language: "te", classId: "c4", studentIds: [], classIds: [] },
    s7: { id: "s7", userId: "s7", username: "Kabir", name: "Kabir Verma", role: "student", language: "en", classId: "c5", studentIds: [], classIds: [] },
    s8: { id: "s8", userId: "s8", username: "Diya", name: "Diya Mukherjee", role: "student", language: "bn", classId: "c5", studentIds: [], classIds: [] },
    s9: { id: "s9", userId: "s9", username: "Vikram", name: "Vikram Malhotra", role: "student", language: "pa", classId: "c2", studentIds: [], classIds: [] },
    s10: { id: "s10", userId: "s10", username: "Ishaan", name: "Ishaan Joshi", role: "student", language: "mr", classId: "c3", studentIds: [], classIds: [] },

    // Parents
    p1: { id: "p1", userId: "p1", username: "Meera", name: "Meera Sharma", role: "parent", language: "en", studentIds: ["s1"], classIds: [] },
    p2: { id: "p2", userId: "p2", username: "Arjun", name: "Arjun Patel", role: "parent", language: "en", studentIds: ["s2"], classIds: [] },
    p3: { id: "p3", userId: "p3", username: "Sunita", name: "Sunita Singh", role: "parent", language: "hi", studentIds: ["s3"], classIds: [] },
    p4: { id: "p4", userId: "p4", username: "Ramesh", name: "Ramesh Gupta", role: "parent", language: "hi", studentIds: ["s5", "s10"], classIds: [] },
    p5: { id: "p5", userId: "p5", username: "Anita", name: "Anita Verma", role: "parent", language: "en", studentIds: ["s7"], classIds: [] },

    // Teachers
    t1: { id: "t1", userId: "t1", username: "AnanyaS", name: "Ananya Sharma", role: "teacher", language: "en", classIds: ["c1", "c2"], studentIds: [] },
    t2: { id: "t2", userId: "t2", username: "VikramRoy", name: "Vikramaditya Roy", role: "teacher", language: "en", classIds: ["c4", "c5"], studentIds: [] },
    t3: { id: "t3", userId: "t3", username: "NehaK", name: "Neha Kulkarni", role: "teacher", language: "mr", classIds: ["c3"], studentIds: [] },

    // Principals / Leadership
    m1: { id: "m1", userId: "m1", username: "Rajesh", name: "Rajesh Kumar", role: "principal", language: "en", studentIds: [], classIds: [] },
    m2: { id: "m2", userId: "m2", username: "Kavita", name: "Dr. Kavita Menon", role: "principal", language: "en", studentIds: [], classIds: [] },
  },

  classes: {
    c1: { id: "c1", classId: "c1", name: "Class 8A", teacherId: "t1", teacherName: "Ananya Sharma", studentIds: ["s1", "s2", "s4"] },
    c2: { id: "c2", classId: "c2", name: "Class 9B", teacherId: "t1", teacherName: "Ananya Sharma", studentIds: ["s3", "s9"] },
    c3: { id: "c3", classId: "c3", name: "Class 8B", teacherId: "t3", teacherName: "Neha Kulkarni", studentIds: ["s5", "s10"] },
    c4: { id: "c4", classId: "c4", name: "Class 9A", teacherId: "t2", teacherName: "Vikramaditya Roy", studentIds: ["s6"] },
    c5: { id: "c5", classId: "c5", name: "Class 10A", teacherId: "t2", teacherName: "Vikramaditya Roy", studentIds: ["s7", "s8"] },
  },

  attendance: {},

  parentStudentMap: {
    p1: ["s1"],
    p2: ["s2"],
    p3: ["s3"],
    p4: ["s5", "s10"],
    p5: ["s7"],
  },

  teacherClassMap: {
    t1: ["c1", "c2"],
    t2: ["c4", "c5"],
    t3: ["c3"],
  },

  escalations: [
    {
      ticketId: "TKT-1001",
      requesterId: "p1",
      requesterName: "Meera Sharma",
      role: "parent",
      targetRole: "teacher",
      studentId: "s1",
      studentName: "Rahul Sharma",
      reason: "Requesting teacher callback regarding Rahul's mathematics project timeline and guidance.",
      status: "pending",
      priority: "medium",
      createdAt: new Date(Date.now() - 3600 * 1000 * 4),
    },
    {
      ticketId: "TKT-1002",
      requesterId: "p5",
      requesterName: "Anita Verma",
      role: "parent",
      targetRole: "management",
      studentId: "s7",
      studentName: "Kabir Verma",
      reason: "Medical absence certificate submitted; requesting attendance threshold regularisation for Board exam eligibility.",
      status: "in-progress",
      priority: "high",
      createdAt: new Date(Date.now() - 3600 * 1000 * 24),
    },
    {
      ticketId: "TKT-1003",
      requesterId: "p4",
      requesterName: "Ramesh Gupta",
      role: "parent",
      targetRole: "teacher",
      studentId: "s5",
      studentName: "Rohan Gupta",
      reason: "School bus route change query for morning pickup on Route 14.",
      status: "resolved",
      priority: "low",
      resolutionNotes: "Route coordinator confirmed pickup point shift to Gate 2 starting Monday.",
      resolvedBy: "t3",
      createdAt: new Date(Date.now() - 3600 * 1000 * 72),
      resolvedAt: new Date(Date.now() - 3600 * 1000 * 12),
    },
    {
      ticketId: "TKT-1004",
      requesterId: "s3",
      requesterName: "Aarav Singh",
      role: "student",
      targetRole: "teacher",
      studentId: "s3",
      studentName: "Aarav Singh",
      reason: "Science Olympiad practice schedule clarification with physics faculty.",
      status: "pending",
      priority: "medium",
      createdAt: new Date(Date.now() - 3600 * 1000 * 2),
    },
  ],
};

// Generate realistic day-by-day attendance for the last 90 working days for all students
function generateAttendanceRecords() {
  const targetRates = {
    s1: 0.912, // Rahul (91.2%)
    s2: 0.874, // Priya (87.4%)
    s3: 0.948, // Aarav (94.8%)
    s4: 0.896, // Ananya (89.6%)
    s5: 0.925, // Rohan (92.5%)
    s6: 0.960, // Sneha (96.0%)
    s7: 0.784, // Kabir (78.4% - alert)
    s8: 0.951, // Diya (95.1%)
    s9: 0.832, // Vikram (83.2%)
    s10: 0.880, // Ishaan (88.0%)
  };

  const today = new Date();
  const daysToGenerate = 120; // 120 calendar days (~85-90 working days)

  for (const [sid, targetRate] of Object.entries(targetRates)) {
    const records = [];
    let workingDays = 0;
    let presentDays = 0;

    for (let i = daysToGenerate; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        records.push({ date: dateStr, status: "weekend" });
      } else {
        workingDays++;
        // pseudo-random deterministic variation based on student id and day index
        const hash = (sid.charCodeAt(1) * 31 + i * 17) % 1000 / 1000;
        const isPresent = hash < targetRate;
        if (isPresent) {
          presentDays++;
          records.push({ date: dateStr, status: "present", remarks: "On time" });
        } else {
          records.push({ date: dateStr, status: "absent", remarks: "Excused/Unexcused absence" });
        }
      }
    }

    const percentage = workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(1) : "100.0";
    memoryStore.attendance[sid] = {
      studentId: sid,
      percentage,
      totalWorkingDays: workingDays,
      presentDays,
      records,
    };
  }
}

generateAttendanceRecords();

export async function seedDatabase() {
  await connectDB();

  if (!isDbConnected()) {
    console.log("ℹ️ Using expanded in-memory dataset.");
    return memoryStore;
  }

  try {
    console.log("🌱 Seeding MongoDB collections with rich mock dataset...");

    // Seed Users
    const defaultPasswordHash = await bcrypt.hash("demo", 10);

    for (const u of Object.values(memoryStore.users)) {
      await User.findOneAndUpdate(
        { userId: u.id },
        {
          userId: u.id,
          username: u.username,
          name: u.name,
          role: u.role,
          language: u.language,
          classId: u.classId || null,
          studentIds: u.studentIds || [],
          classIds: u.classIds || [],
          passwordHash: defaultPasswordHash,
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    // Seed Classes
    for (const c of Object.values(memoryStore.classes)) {
      await SchoolClass.findOneAndUpdate(
        { classId: c.id },
        {
          classId: c.id,
          name: c.name,
          teacherId: c.teacherId,
          teacherName: c.teacherName,
          studentIds: c.studentIds,
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    // Seed Attendance
    for (const [studentId, att] of Object.entries(memoryStore.attendance)) {
      const studentUser = memoryStore.users[studentId];
      await Attendance.findOneAndUpdate(
        { studentId },
        {
          studentId,
          classId: studentUser ? studentUser.classId : null,
          percentage: att.percentage,
          totalWorkingDays: att.totalWorkingDays,
          presentDays: att.presentDays,
          records: att.records,
        },
        { upsert: true, returnDocument: "after" }
      );
    }

    // Seed Escalations
    for (const esc of memoryStore.escalations) {
      await Escalation.findOneAndUpdate(
        { ticketId: esc.ticketId },
        esc,
        { upsert: true, returnDocument: "after" }
      );
    }

    console.log("✅ MongoDB seeding completed successfully with 10 students, 5 classes, 5 parents, 3 teachers, and tickets!");
    return memoryStore;
  } catch (err) {
    console.error("Error during database seed:", err);
    return memoryStore;
  }
}
