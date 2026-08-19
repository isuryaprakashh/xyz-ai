import mongoose from "mongoose";
import { config } from "../config.js";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    if (!config.mongoUri) {
      console.warn("⚠️ No MONGODB_URI configured. Running in fallback mode.");
      return null;
    }

    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.warn("⚠️ Falling back to in-memory store for seamless operation.");
    return null;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}
