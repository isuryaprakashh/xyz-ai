import mongoose from "mongoose";

const periodSchema = new mongoose.Schema({
  periodNumber: { type: Number, required: true },
  time: { type: String, required: true }, // e.g. "09:00 - 09:45"
  subject: { type: String, required: true },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  room: { type: String, default: "Room 101" },
});

const dayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
  periods: [periodSchema],
});

const timetableSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, unique: true, index: true },
    className: { type: String, required: true },
    grade: { type: String, default: "" },
    academicYear: { type: String, default: "2026" },
    schedule: [dayScheduleSchema],
  },
  { timestamps: true }
);

export const Timetable =
  mongoose.models.Timetable || mongoose.model("Timetable", timetableSchema);
