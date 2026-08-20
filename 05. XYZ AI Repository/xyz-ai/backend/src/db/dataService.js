import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Attendance } from "./models/Attendance.js";
import { Escalation } from "./models/Escalation.js";
import { SchoolClass } from "./models/Class.js";
import { Timetable } from "./models/Timetable.js";
import { Session } from "./models/Session.js";
import { isDbConnected } from "./connection.js";

export const dataService = {
  // ─── USER METHODS ───
  async getUser(idOrUsername) {
    if (!idOrUsername) return null;
    try {
      const u = await User.findOne({
        $or: [
          { userId: idOrUsername },
          { username: idOrUsername },
          { email: idOrUsername },
          { name: new RegExp(`^${idOrUsername}$`, "i") },
        ],
      }).lean();
      if (u) return { ...u, id: u.userId };
    } catch (e) {
      console.error("getUser DB error:", e.message);
    }
    return null;
  },

  async getAllUsers(role = null) {
    try {
      const query = role ? { role } : {};
      const list = await User.find(query).select("-passwordHash").lean();
      return list.map((u) => ({ ...u, id: u.userId }));
    } catch (e) {
      console.error("getAllUsers DB error:", e.message);
      return [];
    }
  },

  async createUser(data) {
    try {
      const userId = data.userId || data.username.toLowerCase().replace(/\s+/g, "_");
      const password = data.password || data.username;
      const passwordHash = await bcrypt.hash(password, 8);

      const doc = await User.create({
        userId,
        username: data.username.toLowerCase(),
        name: data.name,
        email: data.email || `${userId}@school.edu`,
        role: data.role || "student",
        language: data.language || "en",
        classId: data.role === "student" ? data.classId || "c1" : null,
        studentIds: data.role === "parent" ? data.studentIds || [] : [],
        classIds: data.role === "teacher" ? data.classIds || ["c1"] : [],
        passwordHash,
      });

      // If new student, initialize attendance doc
      if (doc.role === "student") {
        await Attendance.create({
          studentId: doc.userId,
          classId: doc.classId || "c1",
          percentage: "100.0",
          totalWorkingDays: 1,
          presentDays: 1,
          records: [{ date: new Date().toISOString().split("T")[0], status: "present" }],
        });

        // Add to class studentIds
        if (doc.classId) {
          await SchoolClass.findOneAndUpdate(
            { classId: doc.classId },
            { $addToSet: { studentIds: doc.userId } }
          );
        }
      }

      // If new teacher, add to classIds
      if (doc.role === "teacher" && doc.classIds?.length > 0) {
        for (const cid of doc.classIds) {
          await SchoolClass.findOneAndUpdate(
            { classId: cid },
            { $set: { teacherId: doc.userId, teacherName: doc.name } }
          );
        }
      }

      return { ...doc.toObject(), id: doc.userId };
    } catch (e) {
      console.error("createUser DB error:", e.message);
      throw e;
    }
  },

  async updateUser(userId, updates) {
    try {
      if (updates.password) {
        updates.passwordHash = await bcrypt.hash(updates.password, 8);
        delete updates.password;
      }

      const updated = await User.findOneAndUpdate(
        { $or: [{ userId }, { id: userId }] },
        { $set: updates },
        { returnDocument: "after" }
      ).select("-passwordHash").lean();

      // If class changed for student, sync class studentIds
      if (updated && updated.role === "student" && updates.classId) {
        await SchoolClass.updateMany({}, { $pull: { studentIds: updated.userId } });
        await SchoolClass.findOneAndUpdate(
          { classId: updates.classId },
          { $addToSet: { studentIds: updated.userId } }
        );
        await Attendance.findOneAndUpdate(
          { studentId: updated.userId },
          { $set: { classId: updates.classId } }
        );
      }

      return updated ? { ...updated, id: updated.userId } : null;
    } catch (e) {
      console.error("updateUser DB error:", e.message);
      throw e;
    }
  },

  async deleteUser(userId) {
    try {
      const user = await User.findOne({ $or: [{ userId }, { id: userId }] }).lean();
      if (!user) return false;

      await User.deleteOne({ userId: user.userId });
      await Attendance.deleteOne({ studentId: user.userId });
      await SchoolClass.updateMany({}, { $pull: { studentIds: user.userId } });

      // If parent, pull student reference
      await User.updateMany({}, { $pull: { studentIds: user.userId } });

      return true;
    } catch (e) {
      console.error("deleteUser DB error:", e.message);
      throw e;
    }
  },

  // ─── CLASS METHODS ───
  async getAllClasses() {
    try {
      const classes = await SchoolClass.find({}).lean();
      return classes.map((c) => ({ ...c, id: c.classId }));
    } catch (e) {
      console.error("getAllClasses DB error:", e.message);
      return [];
    }
  },

  async getClass(classId) {
    try {
      const c = await SchoolClass.findOne({ classId }).lean();
      return c ? { ...c, id: c.classId } : null;
    } catch (e) {
      console.error("getClass DB error:", e.message);
      return null;
    }
  },

  async getClassRoster(classId) {
    try {
      const students = await User.find({ role: "student", classId }).select("-passwordHash").lean();
      const withAttendance = await Promise.all(
        students.map(async (s) => {
          const att = await Attendance.findOne({ studentId: s.userId }).lean();
          return {
            ...s,
            id: s.userId,
            percentage: att?.percentage || "90.0",
            presentDays: att?.presentDays || 0,
            totalWorkingDays: att?.totalWorkingDays || 0,
            records: att?.records || [],
          };
        })
      );
      return withAttendance;
    } catch (e) {
      console.error("getClassRoster DB error:", e.message);
      return [];
    }
  },

  // ─── TIMETABLE METHODS ───
  async getTimetableForClass(classId) {
    try {
      return await Timetable.findOne({ classId }).lean();
    } catch (e) {
      console.error("getTimetableForClass DB error:", e.message);
      return null;
    }
  },

  async getAllTimetables() {
    try {
      return await Timetable.find({}).lean();
    } catch (e) {
      console.error("getAllTimetables DB error:", e.message);
      return [];
    }
  },

  async getTimetableForTeacher(teacherIdOrUsername) {
    try {
      const allTimetables = await Timetable.find({}).lean();
      const teacherSchedule = {};

      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      days.forEach((day) => (teacherSchedule[day] = []));

      for (const tt of allTimetables) {
        for (const daySchedule of tt.schedule || []) {
          const matchingPeriods = (daySchedule.periods || []).filter(
            (p) =>
              p.teacherId === teacherIdOrUsername ||
              p.teacherName?.toLowerCase().includes(teacherIdOrUsername.toLowerCase())
          );

          for (const p of matchingPeriods) {
            if (teacherSchedule[daySchedule.day]) {
              teacherSchedule[daySchedule.day].push({
                ...p,
                classId: tt.classId,
                className: tt.className,
                grade: tt.grade,
              });
            }
          }
        }
      }

      // Sort periods by periodNumber
      days.forEach((day) => {
        teacherSchedule[day].sort((a, b) => a.periodNumber - b.periodNumber);
      });

      return {
        teacherId: teacherIdOrUsername,
        schedule: days.map((day) => ({
          day,
          periods: teacherSchedule[day],
        })),
      };
    } catch (e) {
      console.error("getTimetableForTeacher DB error:", e.message);
      return null;
    }
  },

  async updateTimetable(classId, schedule) {
    try {
      return await Timetable.findOneAndUpdate(
        { classId },
        { $set: { schedule, updatedAt: new Date() } },
        { upsert: true, returnDocument: "after" }
      ).lean();
    } catch (e) {
      console.error("updateTimetable DB error:", e.message);
      throw e;
    }
  },

  // ─── ATTENDANCE METHODS ───
  async getAttendance(studentId) {
    if (!studentId) return null;
    try {
      let att = await Attendance.findOne({ studentId }).lean();
      if (!att) {
        const student = await this.getUser(studentId);
        if (student) {
          const newDoc = await Attendance.create({
            studentId,
            classId: student.classId || "c1",
            percentage: "100.0",
            totalWorkingDays: 1,
            presentDays: 1,
            records: [{ date: new Date().toISOString().split("T")[0], status: "present" }],
          });
          return newDoc.toObject();
        }
      }
      return att;
    } catch (e) {
      console.error("getAttendance DB error:", e.message);
      return null;
    }
  },

  async markAttendance({ studentId, date = "today", status = "present", markedBy = null, remarks = "" }) {
    try {
      let doc = await Attendance.findOne({ studentId });
      if (!doc) {
        const student = await this.getUser(studentId);
        doc = new Attendance({
          studentId,
          classId: student?.classId || "c1",
          records: [],
        });
      }

      const formattedDate = date === "today" ? new Date().toISOString().split("T")[0] : date;
      const existing = doc.records.find((r) => r.date === formattedDate || r.date === date);

      if (existing) {
        existing.status = status;
        existing.markedBy = markedBy;
        existing.remarks = remarks;
      } else {
        doc.records.push({ date: formattedDate, status, markedBy, remarks });
      }

      const nonWeekend = doc.records.filter((r) => r.status !== "weekend" && r.status !== "holiday");
      const presentCount = nonWeekend.filter((r) => r.status === "present").length;
      doc.totalWorkingDays = nonWeekend.length;
      doc.presentDays = presentCount;
      doc.percentage = nonWeekend.length > 0 ? ((presentCount / nonWeekend.length) * 100).toFixed(1) : "100.0";

      await doc.save();
      return { success: true, record: { studentId, date: formattedDate, status, percentage: doc.percentage } };
    } catch (e) {
      console.error("markAttendance DB error:", e.message);
      throw e;
    }
  },

  async markClassAttendance({ classId, date = "today", studentStatuses = [], markedBy = null }) {
    try {
      const results = [];
      const formattedDate = date === "today" ? new Date().toISOString().split("T")[0] : date;

      for (const item of studentStatuses) {
        const res = await this.markAttendance({
          studentId: item.studentId,
          date: formattedDate,
          status: item.status || "present",
          markedBy,
          remarks: item.remarks || "",
        });
        results.push(res);
      }

      return { success: true, count: results.length, date: formattedDate, classId };
    } catch (e) {
      console.error("markClassAttendance DB error:", e.message);
      throw e;
    }
  },

  async getSchoolAnalytics() {
    try {
      const allStudents = await User.find({ role: "student" }).lean();
      const classes = await SchoolClass.find({}).lean();

      let totalPctSum = 0;
      let studentCount = 0;
      const studentAttendanceMap = {};

      for (const student of allStudents) {
        const sid = student.userId || student.id;
        const att = await Attendance.findOne({ studentId: sid }).lean();
        if (att) {
          const pct = parseFloat(att.percentage || "0");
          if (!isNaN(pct)) {
            totalPctSum += pct;
            studentCount++;
            studentAttendanceMap[sid] = { student, percentage: pct, att };
          }
        }
      }

      const schoolAvg = studentCount > 0 ? (totalPctSum / studentCount).toFixed(1) : "0.0";

      const classBreakdown = classes.map((c) => {
        const classId = c.classId || c.id;
        const classStudents = allStudents.filter((s) => s.classId === classId);
        let avg = "0.0";
        if (classStudents.length > 0) {
          const classSum = classStudents.reduce((sum, s) => {
            const sid = s.userId || s.id;
            return sum + (studentAttendanceMap[sid]?.percentage || 0);
          }, 0);
          avg = (classSum / classStudents.length).toFixed(1);
        }
        return {
          classId,
          className: c.name,
          teacherName: c.teacherName || "Faculty Lead",
          average: avg,
          studentCount: classStudents.length,
        };
      });

      return { schoolAvg, classBreakdown, totalStudents: studentCount };
    } catch (e) {
      console.error("getSchoolAnalytics DB error:", e.message);
      return { schoolAvg: "0.0", classBreakdown: [], totalStudents: 0 };
    }
  },

  // ─── ESCALATION METHODS ───
  async createEscalation({ requesterId, role, targetRole = "teacher", studentId = null, reason, priority = "medium" }) {
    try {
      const requester = await this.getUser(requesterId);
      let studentName = "";
      if (studentId) {
        const student = await this.getUser(studentId);
        if (student) studentName = student.name;
      }
      const ticketId = `TKT-${Date.now().toString().slice(-6)}`;

      const doc = await Escalation.create({
        ticketId,
        requesterId,
        requesterName: requester?.name || "Requester",
        role,
        targetRole,
        studentId,
        studentName,
        reason,
        priority,
        status: "pending",
      });
      return doc;
    } catch (e) {
      console.error("createEscalation DB error:", e.message);
      throw e;
    }
  },

  async getEscalations(query = {}) {
    try {
      return await Escalation.find(query).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.error("getEscalations DB error:", e.message);
      return [];
    }
  },

  async updateEscalationStatus(ticketId, status) {
    try {
      return await Escalation.findOneAndUpdate(
        { ticketId },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
    } catch (e) {
      console.error("updateEscalationStatus DB error:", e.message);
      throw e;
    }
  },

  // ─── SESSION METHODS ───
  async getSession(sessionId) {
    if (!sessionId) return null;
    try {
      return await Session.findOne({ sessionId });
    } catch (e) {
      console.error("getSession DB error:", e.message);
      return null;
    }
  },

  async saveSession(sessionData) {
    try {
      return await Session.findOneAndUpdate(
        { sessionId: sessionData.sessionId },
        { $set: sessionData },
        { upsert: true, returnDocument: "after" }
      );
    } catch (e) {
      console.error("saveSession DB error:", e.message);
      return sessionData;
    }
  },
};
