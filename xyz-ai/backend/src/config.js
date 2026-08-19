import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || "xyz-ai-dev-secret-key-2026",
  llmProvider: process.env.LLM_PROVIDER || (process.env.GEMINI_API_KEY ? "gemini" : "mock"),
  groqApiKey: process.env.GROQ_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/xyz-ai",
  languages: ["en", "hi", "ta", "te", "mr", "bn", "gu", "pa", "kn", "ml", "ur"],
};