import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["student", "parent", "teacher", "principal", "admin"],
      index: true,
    },
    language: { type: String, default: "en" },
    classId: { type: String, default: null }, // for students
    studentIds: [{ type: String }], // for parents (children)
    classIds: [{ type: String }], // for teachers
    passwordHash: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    phone: { type: String, default: null },
    email: { type: String, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
