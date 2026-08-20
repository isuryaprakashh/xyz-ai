import { users } from "../data/seed.js";

export function findUser(id) {
  return users[id] || null;
}

export function findUserByUsername(username) {
  return Object.values(users).find(u => u.username === username) || null;
}

// Map language codes for Web Speech API
export const speechCodes = {
  en: "en-US", hi: "en-IN", ta: "ta-IN", te: "te-IN", mr: "mr-IN",
  bn: "bn-IN", gu: "gu-IN", pa: "pa-IN", kn: "kn-IN", ml: "ml-IN", ur: "ur-IN"
};