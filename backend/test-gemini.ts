import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env") });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set in .env");
  process.exit(1);
}

console.log("Testing Gemini API Key...");
console.log(`Key snippet: ${apiKey.substring(0, 5)}...`);

const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, this is a test. Reply with 'Key is working!'",
    });
    console.log("✅ API Request Successful!");
    console.log("Response:", result.text());
  } catch (error: any) {
    console.error("❌ API Request Failed!");
    console.error(error.message);
  }
}

test();
