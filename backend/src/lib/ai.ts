import Groq from "groq-sdk";
import { config } from "dotenv";

config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GROQ_API_KEY is not set. AI features will fail.");
}

export const ai = new Groq({ apiKey: apiKey || "MISSING_KEY" });
