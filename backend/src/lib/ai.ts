import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";

config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not set. AI features will fail.");
}

export const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_KEY" });
