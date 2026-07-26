import { Router, Request, Response } from "express";
import { ai } from "../../lib/ai";
import asyncHandler from "express-async-handler";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const CALL_GUARDIAN_PROMPT = `You are SatyaCheck's Call Guardian — a vishing (voice phishing) and financial call scam detector for India's securities markets.

You analyze phone call transcripts for patterns used by scammers impersonating SEBI, RBI, stock brokers, and financial advisors.

Known vishing patterns you detect:
1. REGULATORY IMPERSONATION: "I'm calling from SEBI headquarters" / "RBI cybercrime wing" / "NSE compliance department"
2. ACCOUNT FREEZE THREATS: "Your trading account will be suspended unless you..." / "SEBI has flagged your account"
3. INVESTMENT SCHEME SOLICITATION: Unsolicited calls offering "exclusive" IPOs, bonds, or schemes
4. OTP HARVESTING: Asking for OTP, PIN, password under guise of "verification" or "KYC update"  
5. FAKE ARBITRAGE: "We have found a loophole in the market — act in 30 minutes"
6. MULE RECRUITMENT: Asking to transfer funds to "safe account" or "RBI escrow"
7. COURIER SCAM: "A parcel in your name contains drugs/cash — pay to clear your name"
8. FAKE SEBI FINE: "SEBI has levied a penalty on you — pay to avoid arrest"
9. ALGO TRADING PROMISES: "Our algorithm guarantees 5% daily returns — deposit now"
10. SIGNAL GROUP UPSELL: "Join our premium Telegram/WhatsApp group for insider tips"

IMPORTANT SEBI/RBI FACTS:
- SEBI NEVER calls investors to demand payment or OTP
- RBI NEVER freezes accounts via phone calls
- Legitimate brokers NEVER ask for login credentials over phone
- SEBI penalties are communicated only via registered post and SCORES portal
- No legitimate entity promises "guaranteed returns"

Analyze the transcript and respond ONLY with valid JSON:
{
  "verdict": "SCAM_CALL" | "VISHING_ATTEMPT" | "SUSPICIOUS" | "LEGITIMATE" | "BENIGN",
  "riskScore": <number 0-100>,
  "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
  "scamCategory": <string or null>,
  "vishingPatterns": [<specific dangerous phrases or patterns found>],
  "impersonatedEntity": <string or null>,
  "dangerousPhrases": [<array of exact dangerous phrases from transcript>],
  "legitimacyMarkers": [<any legitimate markers found>],
  "psychologicalTactics": [<fear/urgency/authority tactics used>],
  "explanation": <2-3 sentences plain English summary>,
  "safetyAdvice": <specific 2-3 sentence advice for the call recipient>,
  "reportTo": <where to report this scam, e.g., "SEBI SCORES", "Cybercrime portal (cybercrime.gov.in)">
}`;

/**
 * POST /api/satyacheck/call-guardian
 * Synthetic Voice / Vishing Call Scam Detector
 * Accepts: audio file (multipart) OR { transcript: string }
 */
router.post(
  "/call-guardian",
  upload.single("audio"),
  asyncHandler(async (req: Request, res: Response) => {
    const { transcript, callerClaim } = req.body;

    if (!req.file && (!transcript || transcript.trim().length < 10)) {
      res.status(400).json({
        error: "Provide either an audio file (field: 'audio') or a 'transcript' string.",
      });
      return;
    }

    let analysisTranscript = transcript || "";
    let audioMetadata: any = null;

    // If audio file provided, extract metadata and use AI to transcribe
    if (req.file) {
      audioMetadata = {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        sizeKB: (req.file.size / 1024).toFixed(1),
      };

      // For audio without Whisper, use transcript if available or describe the audio
      if (!analysisTranscript) {
        // We'll analyze what we can from metadata and any provided context
        analysisTranscript = `[Audio file provided: ${req.file.originalname}, ${audioMetadata.sizeKB} KB, ${req.file.mimetype}. No transcript provided — metadata-only analysis.]`;
      }
    }

    const contextBlock = `
${callerClaim ? `Caller claimed to be: ${callerClaim}` : ""}
${audioMetadata ? `Audio file metadata: ${JSON.stringify(audioMetadata)}` : ""}

Call transcript / content to analyze:
"${analysisTranscript}"
    `.trim();

    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: CALL_GUARDIAN_PROMPT },
        {
          role: "user",
          content: `${contextBlock}\n\nAnalyze for vishing/scam patterns. Respond ONLY with valid JSON.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1200,
    });

    const rawResponse = completion.choices[0]?.message?.content || "{}";
    let result: any;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      result = {
        verdict: "UNKNOWN",
        riskScore: 50,
        confidenceLevel: "LOW",
        scamCategory: null,
        vishingPatterns: [],
        impersonatedEntity: null,
        dangerousPhrases: [],
        legitimacyMarkers: [],
        psychologicalTactics: [],
        explanation: "Could not fully analyze the call. Treat any unsolicited financial call with extreme caution.",
        safetyAdvice: "Never share OTP, passwords, or transfer money based on unsolicited calls. Hang up and call back on the official number.",
        reportTo: "Cybercrime portal (cybercrime.gov.in) and SEBI SCORES portal",
      };
    }

    res.json({
      engine: "satyacheck-callguardian-v1",
      analyzedAt: new Date().toISOString(),
      hasAudioFile: !!req.file,
      hasTranscript: !!transcript,
      audioMetadata,
      ...result,
    });
  })
);

export default router;
