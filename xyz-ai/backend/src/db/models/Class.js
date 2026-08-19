import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    classId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    grade: { type: String, default: "" },
    section: { type: String, default: "" },
    teacherId: { type: String, default: null },
    teacherName: { type: String, default: "" },
    studentIds: [{ type: String }],
    roomNumber: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SchoolClass =
  mongoose.models.SchoolClass || mongoose.model("SchoolClass", classSchema);
