import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  intent: { type: String, default: null },
  entities: { type: Object, default: {} },
  toolResult: { type: Object, default: null },
  timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    language: { type: String, default: "en" },
    messages: [messageSchema],
    state: {
      pendingEscalation: { type: Object, default: null },
      lastQueryDate: { type: String, default: "today" },
      lastQueryStudentId: { type: String, default: null },
      lastQueryClassId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
