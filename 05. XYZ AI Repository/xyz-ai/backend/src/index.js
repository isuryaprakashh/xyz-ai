import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import attendanceRoutes from "./routes/attendance.js";
import escalationRoutes from "./routes/escalation.js";
import userRoutes from "./routes/users.js";
import demoRoutes from "./routes/demo.js";
import auditRoutes from "./routes/audit.js";
import { createAgent } from "./orchestrator/agent.js";
import { config } from "./config.js";
import { connectDB, isDbConnected } from "./db/connection.js";
import { seedDatabase } from "./db/seed.js";
import { apiLimiter, chatLimiter } from "./middleware/rateLimit.js";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow flexible demo assets
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json({ limit: "1mb" }));

// Rate limiters
app.use("/api/", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/escalation", escalationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/audit", auditRoutes);

app.get("/api/health", (req, res) =>
  res.json({
    status: "healthy",
    dbConnected: isDbConnected(),
    llmProvider: config.llmProvider,
    timestamp: new Date().toISOString(),
  })
);

// Chat endpoint — core AI school assistant
const agent = createAgent();

app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    const { message, sessionId, language, userId } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message_required", message: "Message cannot be empty." });
    }

    // Resolve userId: check Authorization Bearer token or body userId
    let resolvedUserId = userId;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.slice(7), config.jwtSecret);
        if (decoded?.userId) resolvedUserId = decoded.userId;
      } catch (e) {
        // use fallback userId
      }
    }

    if (!resolvedUserId) {
      resolvedUserId = "s1"; // default demo student
    }

    const result = await agent.handleMessage({
      userId: resolvedUserId,
      message,
      language: language || "en",
      sessionId,
    });

    res.json({
      sessionId: result.sessionId,
      reply: result.response,
      intent: result.intent,
      entities: result.entities,
      type: result.type,
      toolResult: result.toolResult,
    });
  } catch (err) {
    console.error("Chat orchestration error:", err);
    res.status(500).json({
      error: "internal_error",
      reply: "I encountered an error processing your request. Please try again.",
    });
  }
});

// Start Server
async function startServer() {
  try {
    console.log("🔄 Initializing XYZ AI Backend Services...");
    await connectDB();
    await seedDatabase();

    app.listen(config.port, () => {
      console.log(`===========================================`);
      console.log(`🚀 XYZ AI Backend running on port ${config.port}`);
      console.log(`🧠 LLM Provider: ${config.llmProvider} (Gemini / Mock failover)`);
      console.log(`🗄️ Database: ${isDbConnected() ? "MongoDB Atlas Connected" : "In-Memory Fallback"}`);
      console.log(`🌐 Ready for API & Chat requests`);
      console.log(`===========================================`);
    });
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
}

startServer();
