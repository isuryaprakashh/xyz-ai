import { getLLMProvider } from "../llm/index.js";
import { dataService } from "../db/dataService.js";
import { logToolCall } from "../middleware/audit.js";

// Prompt injection heuristic filter
function isPromptInjection(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const patterns = [
    /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
    /reveal\s+(system\s+)?prompt/i,
    /what\s+is\s+your\s+system\s+prompt/i,
    /display\s+your\s+instructions/i,
    /drop\s+database/i,
    /api[_\s]key/i,
    /jwt[_\s]secret/i,
  ];
  return patterns.some((p) => p.test(lower));
}

export function createAgent() {
  const llm = getLLMProvider();
  const memorySessions = new Map();

  async function executeTool(intent, entities, session, userProfile) {
    const role = userProfile.role;
    const userId = userProfile.userId || userProfile.id;

    switch (intent) {
      case "get_own_attendance": {
        if (role !== "student") {
          logToolCall({ userId, role, action: intent, target: userId, success: false });
          return { error: "forbidden", message: "Only students can view their own personal attendance directly." };
        }
        const record = await dataService.getAttendance(userId);
        if (!record) return { error: "not_found", message: "Attendance data not found." };
        logToolCall({ userId, role, action: intent, target: userId, success: true });
        return {
          percentage: record.percentage,
          name: userProfile.name,
          records: (record.records || []).slice(-10),
          totalWorkingDays: record.totalWorkingDays,
          presentDays: record.presentDays,
        };
      }

      case "get_child_attendance": {
        if (role !== "parent") {
          logToolCall({ userId, role, action: intent, target: entities.studentName, success: false });
          return { error: "forbidden", message: "Only parents can view child attendance." };
        }

        // Resolve child by name from parent's assigned studentIds
        const parentStudentIds = userProfile.studentIds || [];
        let resolvedStudent = null;

        // Check assigned children first
        for (const sid of parentStudentIds) {
          const s = await dataService.getUser(sid);
          if (s) {
            if (!entities.studentName || entities.studentName === "child" || s.name.toLowerCase().includes(entities.studentName.toLowerCase())) {
              resolvedStudent = s;
              break;
            }
          }
        }

        // If parent asked for a student they don't own -> RBAC BLOCK
        if (!resolvedStudent) {
          // Check if student exists at all in the school to give proper RBAC denial vs not found
          const allUsers = await dataService.getAllUsers();
          const targetStudent = allUsers.find(
            (u) => u.role === "student" && entities.studentName && u.name.toLowerCase().includes(entities.studentName.toLowerCase())
          );

          if (targetStudent) {
            logToolCall({ userId, role, action: intent, target: targetStudent.userId || targetStudent.id, success: false });
            return {
              error: "forbidden",
              message: `Access denied. You are only authorized to view records for your registered children (${parentStudentIds.join(", ")}).`,
            };
          }

          if (parentStudentIds.length > 0) {
            resolvedStudent = await dataService.getUser(parentStudentIds[0]);
          }
        }

        if (!resolvedStudent) {
          return { error: "not_found", message: "No registered child found under your account." };
        }

        const sid = resolvedStudent.userId || resolvedStudent.id;
        const record = await dataService.getAttendance(sid);
        logToolCall({ userId, role, action: intent, target: sid, success: true });

        return {
          studentId: sid,
          name: resolvedStudent.name,
          percentage: record?.percentage || "90.0",
          records: (record?.records || []).slice(-10),
          totalWorkingDays: record?.totalWorkingDays,
          presentDays: record?.presentDays,
        };
      }

      case "mark_attendance": {
        if (role !== "teacher") {
          logToolCall({ userId, role, action: intent, target: entities.studentName, success: false });
          return { error: "forbidden", message: "Only teachers can mark student attendance." };
        }

        // Resolve student
        const allUsers = await dataService.getAllUsers();
        let targetStudent = null;

        if (entities.studentName) {
          targetStudent = allUsers.find(
            (u) => u.role === "student" && u.name.toLowerCase().includes(entities.studentName.toLowerCase())
          );
        }

        if (!targetStudent) {
          return { error: "not_found", message: `Student "${entities.studentName}" not found.` };
        }

        // Verify teacher teaches target student's class
        const teacherClassIds = userProfile.classIds || [];
        if (!teacherClassIds.includes(targetStudent.classId)) {
          logToolCall({ userId, role, action: intent, target: targetStudent.userId || targetStudent.id, success: false });
          return {
            error: "forbidden",
            message: `You can only mark attendance for students in your assigned classes (${teacherClassIds.join(", ")}). ${targetStudent.name} belongs to ${targetStudent.classId}.`,
          };
        }

        const sid = targetStudent.userId || targetStudent.id;
        const markResult = await dataService.markAttendance({
          studentId: sid,
          date: entities.date || "today",
          status: entities.status || "present",
          markedBy: userId,
        });

        logToolCall({ userId, role, action: intent, target: sid, success: true });
        return {
          success: true,
          record: {
            ...markResult.record,
            studentName: targetStudent.name,
          },
        };
      }

      case "get_school_attendance_analytics": {
        if (role !== "principal" && role !== "admin") {
          logToolCall({ userId, role, action: intent, target: "school", success: false });
          return { error: "forbidden", message: "Only school principals and administrators can view school-wide analytics." };
        }

        const analytics = await dataService.getSchoolAnalytics();
        logToolCall({ userId, role, action: intent, target: "school", success: true });
        return analytics;
      }

      case "escalate": {
        // Step 1: Store pending escalation in session, prompt confirmation
        session.state.pendingEscalation = {
          targetRole: entities.targetRole || "teacher",
          reason: entities.reason || "Parent/Student query needs direct staff follow-up",
          studentId: role === "student" ? userId : userProfile.studentIds?.[0] || null,
        };
        return {
          intent: "escalate",
          targetRole: entities.targetRole || "teacher",
          reason: entities.reason || "Assistance needed",
          pendingConfirmation: true,
        };
      }

      case "confirm_escalation": {
        const pending = session.state.pendingEscalation || {
          targetRole: "teacher",
          reason: "User requested callback",
          studentId: role === "student" ? userId : userProfile.studentIds?.[0] || null,
        };

        const ticket = await dataService.createEscalation({
          requesterId: userId,
          role,
          targetRole: pending.targetRole || "teacher",
          studentId: pending.studentId,
          reason: pending.reason || "General school callback request",
        });

        session.state.pendingEscalation = null;
        logToolCall({ userId, role, action: "escalate_created", target: ticket.ticketId, success: true });

        return {
          ticketId: ticket.ticketId,
          targetRole: pending.targetRole || "teacher",
          status: "pending",
          success: true,
        };
      }

      default:
        return null;
    }
  }

  return {
    async handleMessage({ userId, message, language = "en", sessionId }) {
      // 1. Prompt Injection Sanitization
      if (isPromptInjection(message)) {
        return {
          type: "response",
          response: "⚠️ Security alert: This system only processes school and attendance operations. Instructions cannot be overridden.",
          intent: "security_block",
          entities: {},
          sessionId: sessionId || `sess-${Date.now()}`,
        };
      }

      // 2. Fetch User Profile
      const userProfile = (await dataService.getUser(userId)) || {
        id: userId,
        userId,
        name: "Demo User",
        role: "student",
        language: "en",
      };

      // 3. Load or initialize session
      const sid = sessionId || `sess-${userId}-${Date.now()}`;
      let session = memorySessions.get(sid);
      if (!session) {
        session = {
          sessionId: sid,
          userId,
          role: userProfile.role,
          language: language || userProfile.language || "en",
          history: [],
          state: {
            pendingEscalation: null,
            lastQueryDate: "today",
            lastQueryStudentId: null,
          },
        };
        memorySessions.set(sid, session);
      }
      session.language = language || session.language;

      // Add to session history
      session.history.push({ role: "user", content: message });

      // 4. Understand Intent with LLM or Pending Escalation State
      let understanding = null;

      // Handle direct confirmation or cancellation of pending escalation
      if (session.state.pendingEscalation) {
        const lower = message.toLowerCase();
        if (lower.includes("yes") || lower.includes("confirm") || lower.includes("proceed") || lower.includes("please") || lower.includes("sure") || lower.includes("ok")) {
          understanding = {
            intent: "confirm_escalation",
            entities: session.state.pendingEscalation,
          };
        } else if (lower.includes("no") || lower.includes("cancel") || lower.includes("stop") || lower.includes("nevermind")) {
          session.state.pendingEscalation = null;
          understanding = {
            intent: "general_query",
            directResponse: "No problem! I have cancelled the callback request. Let me know if you need help with anything else.",
          };
        }
      }

      if (!understanding) {
        understanding = await llm.understand(message, userProfile.role, session, userProfile);
      }

      if (understanding?.needsClarification) {
        const clarMsg =
          understanding.clarificationMessage ||
          "Could you please specify which student or date you are referring to?";
        session.history.push({ role: "assistant", content: clarMsg });
        return {
          type: "clarification",
          response: clarMsg,
          intent: understanding.intent,
          entities: understanding.entities,
          sessionId: session.sessionId,
        };
      }

      let toolResult = null;
      let finalReply = null;

      if (understanding?.intent && understanding.intent !== "general_query") {
        toolResult = await executeTool(understanding.intent, understanding.entities || {}, session, userProfile);
      }

      // 5. Generate Natural Multilingual Response
      if (understanding?.directResponse && !toolResult) {
        finalReply = understanding.directResponse;
      } else {
        finalReply = await llm.generateReply({
          userRole: userProfile.role,
          language: session.language,
          intent: understanding?.intent || "general_query",
          toolResult,
          originalMessage: message,
          userProfile,
        });
      }

      if (!finalReply) {
        finalReply = "I am XYZ AI, your school assistant. How can I assist you with your attendance or school records today?";
      }

      session.history.push({ role: "assistant", content: finalReply });

      // Persist session to MongoDB / Memory
      await dataService.saveSession(session);

      return {
        type: "response",
        response: finalReply,
        sessionId: session.sessionId,
        intent: understanding?.intent || "general_query",
        entities: understanding?.entities || {},
        toolResult,
      };
    },
  };
}