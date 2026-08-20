import { Router } from "express";
import { User } from "../db/models/User.js";
import { SchoolClass } from "../db/models/Class.js";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { dataService } from "../db/dataService.js";
import { logToolCall } from "../middleware/audit.js";

const router = Router();

// GET /api/users — List users with optional role/class filter
router.get("/", auth, async (req, res) => {
  try {
    const { role, classId } = req.query;
    const query = {};
    if (role) query.role = role;
    if (classId) query.classId = classId;

    const users = await User.find(query).select("-passwordHash").lean();
    res.json({ users: users.map((u) => ({ ...u, id: u.userId })) });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// GET /api/users/classes — List all classrooms with student count and faculty lead
router.get("/classes/all", auth, async (req, res) => {
  try {
    const classes = await dataService.getAllClasses();
    res.json({ classes });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// POST /api/users — Principal & Admin create new student / faculty
router.post("/", auth, requireRole("principal", "admin"), async (req, res) => {
  try {
    const { name, username, role, email, classId, classIds, studentIds, password } = req.body;

    if (!name || !username || !role) {
      return res.status(400).json({ error: "missing_fields", message: "Name, username, and role are required." });
    }

    const existing = await dataService.getUser(username);
    if (existing) {
      return res.status(409).json({ error: "user_exists", message: `Username '${username}' is already registered.` });
    }

    const newUser = await dataService.createUser({
      name,
      username,
      role,
      email,
      classId,
      classIds,
      studentIds,
      password: password || username,
    });

    logToolCall({
      userId: req.user.userId || req.user.id,
      role: req.user.role,
      action: "create_user",
      target: newUser.userId,
      success: true,
      details: `${role}:${name}`,
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// PUT /api/users/:id — Principal & Admin update user details & class assignment
router.put("/:id", auth, requireRole("principal", "admin"), async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    const updatedUser = await dataService.updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: "user_not_found" });
    }

    logToolCall({
      userId: req.user.userId || req.user.id,
      role: req.user.role,
      action: "update_user",
      target: userId,
      success: true,
      details: JSON.stringify(updates),
    });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// DELETE /api/users/:id — Principal & Admin delete user
router.delete("/:id", auth, requireRole("principal", "admin"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (userId === req.user.userId || userId === req.user.id) {
      return res.status(400).json({ error: "cannot_delete_self", message: "Administrators cannot delete their own account." });
    }

    const success = await dataService.deleteUser(userId);
    if (!success) {
      return res.status(404).json({ error: "user_not_found" });
    }

    logToolCall({
      userId: req.user.userId || req.user.id,
      role: req.user.role,
      action: "delete_user",
      target: userId,
      success: true,
    });

    res.json({ success: true, message: `User ${userId} deleted successfully.` });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await dataService.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: "user_not_found" });

    res.json({
      id: user.userId,
      userId: user.userId,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      language: user.language,
      classId: user.classId,
      studentIds: user.studentIds,
      classIds: user.classIds,
    });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

export default router;