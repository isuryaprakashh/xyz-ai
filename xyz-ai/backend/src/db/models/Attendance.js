import mongoose from "mongoose";

const attendanceRecordSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD or readable string
  status: {
    type: String,
    required: true,
    enum: ["present", "absent", "leave", "holiday", "weekend"],
    default: "present",
  },
  markedBy: { type: String, default: null }, // teacherId
  remarks: { type: String, default: "" },
});

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    classId: { type: String, default: null, index: true },
    percentage: { type: String, default: "90.0" },
    totalWorkingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },
    records: [attendanceRecordSchema],
  },
  { timestamps: true }
);

export const Attendance =
  mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
