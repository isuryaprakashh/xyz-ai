import { User } from "./models/User.js";
import { Attendance } from "./models/Attendance.js";
import { Escalation } from "./models/Escalation.js";
import { SchoolClass } from "./models/Class.js";
import { Session } from "./models/Session.js";
import { isDbConnected } from "./connection.js";

export const dataService = {
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
      const list = await User.find(query).lean();
      return list.map((u) => ({ ...u, id: u.userId }));
    } catch (e) {
      console.error("getAllUsers DB error:", e.message);
      return [];
    }
  },

  async getAttendance(studentId) {
    if (!studentId) return null;
    try {
      let att = await Attendance.findOne({ studentId }).lean();
      if (!att) {
        // If not created yet, initialize an empty attendance doc
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

      // Recalculate working days and percentage
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

