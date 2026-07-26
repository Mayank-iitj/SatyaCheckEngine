import { Router, Request, Response } from "express";
import { ai } from "../../lib/ai";
import asyncHandler from "express-async-handler";

const router = Router();

const PHISHING_SYSTEM_PROMPT = `You are SatyaCheck's LLM Phishing & Scam Detection Engine for India's securities markets.

Your job is to analyze text messages, emails, WhatsApp forwards, or URLs for financial scams targeting retail investors.

You detect:
1. IMPERSONATION: Fake SEBI, NSE, BSE, RBI, AMFI, CDSL, NSDL officials/communications
2. PUMP & DUMP: "Hot tip", "insider info", "guaranteed returns", "multibagger stock"
3. FAKE ADVISORS: Unregistered investment advisors claiming SEBI registration
4. PHISHING URLs: URLs mimicking official SEBI/NSE/BSE/broker domains
5. URGENCY SCAMS: "Act now", "limited offer", "exclusive WhatsApp group"
6. OTP/KYC FRAUD: Requests for Aadhaar OTP, PAN, bank credentials under guise of KYC
7. FAKE IPO ALLOTMENT: Messages claiming lottery IPO allotment requiring payment
8. ALGO TRADING SCAMS: Promises of automated high-return trading bots

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "SCAM" | "SUSPICIOUS" | "LEGITIMATE" | "UNKNOWN",
  "riskScore": <number 0-100>,
  "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
  "scamType": <string or null>,
  "redFlags": [<array of specific red flag strings found in the text>],
  "safeIndicators": [<array of legitimate indicators if any>],
  "explanation": <2-3 sentence plain-English explanation of verdict>,
  "safetyAdvice": <1-2 sentence advice for the investor>,
  "impersonatedEntity": <name of entity being impersonated, or null>
}`;

/**
 * POST /api/satyacheck/text-verify
 * LLM Phishing & Securities Scam Text Analyzer
 */
router.post(
  "/text-verify",
  asyncHandler(async (req: Request, res: Response) => {
    const { text, url } = req.body;

    if (!text && !url) {
      res.status(400).json({ error: "Provide 'text' or 'url' to analyze." });
      return;
    }

    const inputContent = url ? `URL to analyze: ${url}` : text;

    if (inputContent.length > 8000) {
      res.status(400).json({ error: "Input too long. Maximum 8000 characters." });
      return;
    }

    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: PHISHING_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze the following for securities market scams:\n\n---\n${inputContent}\n---\n\nRespond ONLY with valid JSON.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const rawResponse = completion.choices[0]?.message?.content || "{}";

    let result: any;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      // Fallback if JSON parse fails
      result = {
        verdict: "UNKNOWN",
        riskScore: 50,
        confidenceLevel: "LOW",
        scamType: null,
        redFlags: [],
        safeIndicators: [],
        explanation: "Analysis could not be completed. Treat with caution.",
        safetyAdvice: "When in doubt, verify directly with SEBI SCORES portal or your registered broker.",
        impersonatedEntity: null,
      };
    }

    res.json({
      engine: "satyacheck-text-v1",
      analyzedAt: new Date().toISOString(),
      inputLength: inputContent.length,
      ...result,
    });
  })
);

export default router;
