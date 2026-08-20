import { Router } from "express";
import { User } from "../db/models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// GET /api/users — List users with optional role filter
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

// GET /api/users/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ userId: req.params.id }, { username: req.params.id }],
    }).select("-passwordHash").lean();

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

// GET /api/users/:id/relationships
router.get("/:id/relationships", auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id }).lean();
    if (!user) return res.status(404).json({ error: "user_not_found" });
    res.json({
      studentIds: user.studentIds || [],
      classIds: user.classIds || [],
    });
  } catch (err) {
    res.status(500).json({ error: "internal_error", message: err.message });
  }
});

export default router;