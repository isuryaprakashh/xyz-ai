import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "../config.js";
import { User } from "../db/models/User.js";
import { Attendance } from "../db/models/Attendance.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Helper to generate JWT
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId || user.id,
      role: user.role,
      name: user.name,
      username: user.username,
    },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register — Full real registration
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, role, language = "en", classId, studentIds = [], classIds = [] } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ error: "missing_fields", message: "Name, username, password, and role are required." });
    }

    if (!["student", "parent", "teacher", "principal", "admin"].includes(role)) {
      return res.status(400).json({ error: "invalid_role", message: "Invalid role specified." });
    }

    const cleanUsername = username.trim();
    const existingUser = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, "i") },
        { email: email ? email.trim() : "---" },
      ],
    });

    if (existingUser) {
      return res.status(409).json({ error: "user_exists", message: "Username or email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `${role[0]}_${Date.now().toString().slice(-6)}`;

    const newUser = await User.create({
      userId,
      username: cleanUsername,
      email: email ? email.trim() : `${cleanUsername.toLowerCase()}@school.edu`,
      name: name.trim(),
      passwordHash,
      role,
      language,
      classId: role === "student" ? classId || "c1" : null,
      studentIds: role === "parent" ? (Array.isArray(studentIds) ? studentIds : [studentIds]) : [],
      classIds: role === "teacher" ? (Array.isArray(classIds) ? classIds : [classIds]) : [],
    });

    // If student, create initial attendance document
    if (role === "student") {
      await Attendance.create({
        studentId: userId,
        classId: newUser.classId,
        percentage: "100.0",
        totalWorkingDays: 1,
        presentDays: 1,
        records: [{ date: new Date().toISOString().split("T")[0], status: "present" }],
      });
    }

    const token = generateToken(newUser);

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: newUser.userId,
        userId: newUser.userId,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        language: newUser.language,
        classId: newUser.classId,
        studentIds: newUser.studentIds,
        classIds: newUser.classIds,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "registration_failed", message: err.message });
  }
});

// POST /api/auth/login — Real password verification with fallback
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "missing_credentials", message: "Username and password are required." });
    }

    const cleanUsername = username.trim();
    const user = await User.findOne({
      $or: [
        { username: cleanUsername },
        { username: new RegExp(`^${cleanUsername}$`, "i") },
        { email: cleanUsername },
        { userId: cleanUsername },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "invalid_credentials", message: "User account not found." });
    }

    // Real password validation
    let isMatch = false;
    if (user.passwordHash) {
      isMatch = await bcrypt.compare(password, user.passwordHash);
    }
    // Also match if password equals username or demo
    if (!isMatch && (password === "demo" || password === cleanUsername || password.toLowerCase() === user.username.toLowerCase())) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: "invalid_credentials", message: "Incorrect password." });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user.userId || user.id,
        userId: user.userId || user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        language: user.language,
        classId: user.classId,
        studentIds: user.studentIds,
        classIds: user.classIds,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "login_failed", message: err.message });
  }
});

// GET /api/auth/me — Return current authenticated session profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId || req.user.id });
    if (!user) {
      return res.status(404).json({ error: "user_not_found", message: "Session user not found." });
    }
    res.json({
      user: {
        id: user.userId || user.id,
        userId: user.userId || user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        language: user.language,
        classId: user.classId,
        studentIds: user.studentIds,
        classIds: user.classIds,
      },
    });
  } catch (err) {
    console.error("Session lookup error:", err);
    res.status(500).json({ error: "lookup_failed", message: err.message });
  }
});

export default router;