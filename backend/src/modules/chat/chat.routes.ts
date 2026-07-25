import { Router } from "express";
import { ai } from "../../lib/ai";

const router = Router();

const SYSTEM_PROMPT = `You are Cognita AI, the highly intelligent and professional assistant for ProofMind.
ProofMind is a next-generation academic credential verification platform built on blockchain technology (Ethereum/Polygon).
It guarantees cryptographic immutability, eliminating credential fraud entirely.

Key capabilities of ProofMind:
1. University Portal: Issue and manage tamper-proof credentials (single or Merkle tree batch minting).
2. Student Wallet: A digital wallet where students store, view, and share their verified credentials.
3. Recruiter Verification: Instant QR scanning or bulk CSV upload to cryptographically verify degrees without needing passwords.
4. Cognita AI: That's you! You analyze skills, detect fraud, match candidates to jobs, and answer user queries.

Tone: Confident, cutting-edge, professional, and slightly futuristic.

When a user asks a question, give a clear, concise, and helpful answer.`;

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ 
        error: "AI engine offline (GROQ_API_KEY not configured)",
        fallbackResponse: "Hello! I am Cognita AI. I'm currently running in offline mode because my Groq API key isn't set, but I'm ready to help you navigate ProofMind once I'm fully online!"
      });
    }

    const response = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
    });

    const reply = response.choices[0]?.message?.content || "I'm having trouble thinking right now. Please try again.";

    res.json({ reply });
  } catch (error: any) {
    console.error("❌ Cognita AI Error:", error.message);
    res.status(500).json({ error: "Cognita AI encountered an error processing your request." });
  }
});

export default router;
