import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi (हिन्दी)",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  mr: "Marathi (मराठी)",
  bn: "Bengali (বাংলা)",
  gu: "Gujarati (ગુજરાતી)",
  pa: "Punjabi (ਪੰਜਾਬੀ)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  ur: "Urdu (اردو)",
};

const PERSONA_PROMPTS = {
  student: `You are XYZ AI, a warm, motivating, and helpful Academic Assistant for students.
Your tone is friendly, encouraging, and clear. Help students track their attendance, understand academic requirements, and advise them on staying consistent.`,
  parent: `You are XYZ AI, a caring, patient, and reassuring Parent Support Assistant.
Your tone is empathetic, respectful, and transparent. Help parents stay informed about their child's school attendance, performance, and easily connect with teachers when needed.`,
  teacher: `You are XYZ AI, an efficient, professional, and proactive Teaching Assistant.
Your tone is collaborative, organized, and focused on classroom efficiency. Help teachers quickly mark attendance, review student records, and manage student escalation requests.`,
  principal: `You are XYZ AI, an executive-level Management & School Analytics Assistant.
Your tone is professional, insightful, and data-driven. Help principals and school leadership monitor overall school attendance rates, section-level breakdowns, and institutional insights.`,
};

export function createGeminiLLM() {
  let genAI = null;
  if (config.geminiApiKey) {
    try {
      genAI = new GoogleGenerativeAI(config.geminiApiKey);
    } catch (e) {
      console.warn("⚠️ Failed to initialize GoogleGenerativeAI:", e.message);
    }
  }

  return {
    async understand(message, userRole, session, userProfile) {
      if (!genAI) {
        return null; // triggers fallback
      }

      const targetLang = LANGUAGE_NAMES[session.language] || "English";
      const persona = PERSONA_PROMPTS[userRole] || PERSONA_PROMPTS.student;

      const systemInstruction = `${persona}

CRITICAL RULES:
1. You are operating in an educational ERP system.
5. Intent Schema:
   - "get_own_attendance": Student asking for their own attendance.
   - "get_child_attendance": Parent asking for their child's attendance (extract entity: studentName).
   - "mark_attendance": Teacher marking attendance (extract entities: studentName, status ("present"/"absent"), date ("today", "yesterday", or YYYY-MM-DD)).
   - "get_school_attendance_analytics": Principal asking for school-wide or class attendance metrics/analytics.
   - "get_timetable": User asking about timetable, daily periods, classes, schedule, or next class (extract entities: day ("Monday", "Tuesday", etc. or "today"), targetClass ("c1", "c2", etc.)).
   - "escalate": User wants to contact, talk to, or raise a complaint/ticket with a teacher or school management (extract entities: targetRole ("teacher" or "management"), reason).
   - "confirm_escalation": User answering "yes", "proceed", "sure", "please do" to a pending escalation confirmation.
   - "general_query": Greeting, general school advice, question, or clarification.

3. Context & Current User:
   - Current User Name: ${userProfile?.name || "User"}
   - Role: ${userRole}
   - Children associated: ${JSON.stringify(userProfile?.studentIds || [])}
   - Assigned Classes: ${JSON.stringify(userProfile?.classIds || [])}
   - Pending Escalation in session: ${session.state?.pendingEscalation ? JSON.stringify(session.state.pendingEscalation) : "None"}
   - Target Response Language: ${targetLang} (MANDATORY: all user-facing responses must be in ${targetLang} unless user explicitly switches language).

4. Output Format:
You MUST ALWAYS respond with ONLY a valid JSON object matching this schema (no markdown fences, no preamble):
{
  "intent": "get_own_attendance" | "get_child_attendance" | "mark_attendance" | "get_school_attendance_analytics" | "get_timetable" | "escalate" | "confirm_escalation" | "general_query",
  "entities": {
    "studentName": "string or null",
    "status": "present | absent | null",
    "date": "string or null",
    "day": "string or null",
    "targetClass": "string or null",
    "targetRole": "teacher | management | null",
    "reason": "string or null"
  },
  "needsClarification": boolean,
  "clarificationMessage": "string in ${targetLang} if needsClarification is true, else null",
  "directResponse": "string in ${targetLang} if intent is general_query, else null"
}`;

      const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
      let lastErr = null;

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            },
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
          });

          const historyContext = (session.history || [])
            .slice(-6)
            .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
            .join("\n");

          const prompt = `Recent Conversation:\n${historyContext}\n\nCurrent User Message: "${message}"\n\nAnalyze intent and return JSON:`;

          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();
          const parsed = JSON.parse(text);
          return parsed;
        } catch (err) {
          lastErr = err;
          // continue to next model name if 404
        }
      }
      console.error("All Gemini NLU models failed:", lastErr?.message);
      return null;
    },

    async generateNaturalReply({ userRole, language = "en", intent, toolResult, originalMessage, userProfile }) {
      if (!genAI) return null;

      const targetLang = LANGUAGE_NAMES[language] || "English";
      const persona = PERSONA_PROMPTS[userRole] || PERSONA_PROMPTS.student;

      const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
      let lastErr = null;

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.4,
            },
            systemInstruction: {
              parts: [
                {
                  text: `${persona}
You are generating the final response to the user.
MANDATORY: Reply fluently and naturally in ${targetLang}.
Format nicely using markdown (bullet points or bold highlights where suitable).
Never fabricate data outside the provided Tool Result. If there is an error in Tool Result, explain politely.`,
                },
              ],
            },
          });

          const prompt = `User Profile: ${JSON.stringify(userProfile)}
User's query: "${originalMessage}"
Intent: ${intent}
Tool Execution Result: ${JSON.stringify(toolResult)}

Generate a helpful, human-like response in ${targetLang}:`;

          const result = await model.generateContent(prompt);
          return result.response.text().trim();
        } catch (err) {
          lastErr = err;
        }
      }
      console.error("All Gemini response models failed:", lastErr?.message);
      return null;
    },
  };
}
