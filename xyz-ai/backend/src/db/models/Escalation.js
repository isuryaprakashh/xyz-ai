import mongoose from "mongoose";

const escalationSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    requesterId: { type: String, required: true, index: true },
    requesterName: { type: String, default: "" },
    role: { type: String, required: true },
    targetRole: { type: String, required: true },
    studentId: { type: String, default: null },
    studentName: { type: String, default: "" },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "in_review", "resolved", "rejected"],
      default: "pending",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    resolutionNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Escalation =
  mongoose.models.Escalation || mongoose.model("Escalation", escalationSchema);
