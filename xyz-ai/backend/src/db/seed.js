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
    s1: { id: "s1", userId: "s1", username: "Rahul", name: "Rahul Sharma", role: "student", language: "en", classId: "c1", studentIds: [] },
    s2: { id: "s2", userId: "s2", username: "Priya", name: "Priya Patel", role: "student", language: "en", classId: "c1", studentIds: [] },
    s3: { id: "s3", userId: "s3", username: "Aarav", name: "Aarav Singh", role: "student", language: "hi", classId: "c2", studentIds: [] },
    s4: { id: "s4", userId: "s4", username: "Ananya", name: "Ananya Roy", role: "student", language: "ta", classId: "c1", studentIds: [] },
    p1: { id: "p1", userId: "p1", username: "Meera", name: "Meera Sharma", role: "parent", language: "en", studentIds: ["s1"], classIds: [] },
    p2: { id: "p2", userId: "p2", username: "Arjun", name: "Arjun Patel", role: "parent", language: "en", studentIds: ["s2"], classIds: [] },
    t1: { id: "t1", userId: "t1", username: "AnanyaS", name: "Ananya Sharma", role: "teacher", language: "en", classIds: ["c1", "c2"], studentIds: [] },
    m1: { id: "m1", userId: "m1", username: "Rajesh", name: "Rajesh Kumar", role: "principal", language: "en", studentIds: [], classIds: [] },
  },
  classes: {
    c1: { id: "c1", classId: "c1", name: "Class 8A", teacherId: "t1", teacherName: "Ananya Sharma", studentIds: ["s1", "s2", "s4"] },
    c2: { id: "c2", classId: "c2", name: "Class 9B", teacherId: "t1", teacherName: "Ananya Sharma", studentIds: ["s3"] },
  },
  attendance: {
    s1: { studentId: "s1", percentage: "91.2", totalWorkingDays: 90, presentDays: 82, records: [] },
    s2: { studentId: "s2", percentage: "87.4", totalWorkingDays: 90, presentDays: 78, records: [] },
    s3: { studentId: "s3", percentage: "94.8", totalWorkingDays: 90, presentDays: 85, records: [] },
    s4: { studentId: "s4", percentage: "89.6", totalWorkingDays: 90, presentDays: 80, records: [] },
  },
  parentStudentMap: {
    p1: ["s1"],
    p2: ["s2"],
  },
  teacherClassMap: {
    t1: ["c1", "c2"],
  },
  escalations: [],
};

// Load attendance records from CSV into memoryStore
try {
  const attCsvPath = path.join(DATA_DIR, "attendance.csv");
  if (fs.existsSync(attCsvPath)) {
    const lines = fs.readFileSync(attCsvPath, "utf-8").split("\n").filter(Boolean);
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].trim().split(",");
      if (parts.length >= 3) {
        const [studentId, date, status] = parts;
        if (memoryStore.attendance[studentId]) {
          memoryStore.attendance[studentId].records.push({ date, status });
        }
      }
    }
    // calculate exact percentage
    for (const [sid, att] of Object.entries(memoryStore.attendance)) {
      const nonWeekend = att.records.filter((r) => r.status !== "weekend");
      const present = nonWeekend.filter((r) => r.status === "present").length;
      att.totalWorkingDays = nonWeekend.length;
      att.presentDays = present;
      if (nonWeekend.length > 0) {
        att.percentage = ((present / nonWeekend.length) * 100).toFixed(1);
      }
    }
  }
} catch (e) {
  console.warn("Could not parse attendance.csv into memoryStore:", e.message);
}

export async function seedDatabase() {
  await connectDB();

  if (!isDbConnected()) {
    console.log("ℹ️ Using in-memory dataset.");
    return memoryStore;
  }

  try {
    console.log("🌱 Seeding MongoDB collections...");

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

    // Seed sample Escalations if none exist
    const count = await Escalation.countDocuments();
    if (count === 0) {
      await Escalation.create([
        {
          ticketId: "TKT-1001",
          requesterId: "p1",
          requesterName: "Meera Sharma",
          role: "parent",
          targetRole: "teacher",
          studentId: "s1",
          studentName: "Rahul Sharma",
          reason: "Requesting teacher callback regarding Rahul's math homework progress",
          status: "pending",
          priority: "medium",
        },
      ]);
    }

    console.log("✅ MongoDB seeding completed successfully!");
    return memoryStore;
  } catch (err) {
    console.error("Error during database seed:", err);
    return memoryStore;
  }
}
