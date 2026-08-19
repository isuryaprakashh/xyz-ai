import { createGeminiLLM } from "./gemini.js";
import { createMockLLM } from "./mock.js";
import { config } from "../config.js";

export function getLLMProvider() {
  const gemini = createGeminiLLM();
  const mock = createMockLLM();

  return {
    async understand(message, userRole, session, userProfile) {
      if (config.llmProvider === "gemini" && config.geminiApiKey) {
        try {
          const geminiResult = await gemini.understand(message, userRole, session, userProfile);
          if (geminiResult && geminiResult.intent) {
            return geminiResult;
          }
        } catch (e) {
          console.warn("Gemini understand failed, falling back to mock NLU:", e.message);
        }
      }
      return await mock.understand(message, userRole, session, userProfile);
    },

    async generateReply(params) {
      if (config.llmProvider === "gemini" && config.geminiApiKey) {
        try {
          const reply = await gemini.generateNaturalReply(params);
          if (reply) return reply;
        } catch (e) {
          console.warn("Gemini generateReply failed, falling back to mock generator:", e.message);
        }
      }
      return await mock.generateNaturalReply(params);
    },
  };
}
