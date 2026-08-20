import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    target: { type: String, default: "" },
    success: { type: Boolean, required: true },
    details: { type: String, default: "" },
    ip: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
