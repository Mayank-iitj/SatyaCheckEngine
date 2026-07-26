import { Router, Request, Response } from "express";
import { ai } from "../../lib/ai";
import asyncHandler from "express-async-handler";
import multer from "multer";
import sharp from "sharp";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const DEEPFAKE_SYSTEM_PROMPT = `You are SatyaCheck's Media Authenticity Engine for India's securities markets.

You analyze image metadata, EXIF data, and contextual signals to detect manipulated media used in financial scams.

Common scams you detect:
1. CELEBRITY DEEPFAKES: Fake videos/images of Rakesh Jhunjhunwala, Radhakishan Damani, Nikhil Kamath, Nithin Kamath, politicians endorsing fraudulent schemes
2. FAKE SEBI/RBI LETTERS: Doctored official letterheads, tampered PDFs
3. FABRICATED SCREENSHOTS: Fake Zerodha/Groww/Upstox portfolio screenshots showing massive gains
4. SYNTHETIC ADVISOR PHOTOS: AI-generated profile photos of fake "SEBI-registered" advisors
5. MANIPULATED CHARTS: Edited stock charts showing fake breakouts

Given the image metadata, EXIF data, and visual description, analyze for signs of manipulation.

Respond ONLY with valid JSON:
{
  "verdict": "AUTHENTIC" | "MANIPULATED" | "SUSPICIOUS" | "SYNTHETIC" | "INSUFFICIENT_DATA",
  "confidence": <number 0-100>,
  "c2paPresent": <boolean>,
  "manipulationIndicators": [<array of specific manipulation signals found>],
  "metadataFlags": [<array of suspicious metadata observations>],
  "authenticitySignals": [<array of positive authenticity signals>],
  "scamCategory": <string or null>,
  "explanation": <2-3 sentences explaining the verdict>,
  "recommendation": <1 sentence action recommendation>
}`;

/**
 * POST /api/satyacheck/media-verify
 * Deepfake & Manipulated Media Detector
 */
router.post(
  "/media-verify",
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!req.file && !url) {
      res.status(400).json({ error: "Provide an image file or 'url' parameter." });
      return;
    }

    let metadataReport: any = {};
    let imageSummary = "";

    if (req.file) {
      // Extract metadata using Sharp
      try {
        const metadata = await sharp(req.file.buffer).metadata();
        metadataReport = {
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
          space: metadata.space,
          channels: metadata.channels,
          depth: metadata.depth,
          density: metadata.density,
          chromaSubsampling: metadata.chromaSubsampling,
          isProgressive: metadata.isProgressive,
          hasProfile: metadata.hasProfile,
          hasAlpha: metadata.hasAlpha,
          exif: metadata.exif ? "EXIF data present" : "No EXIF data",
          icc: metadata.icc ? "ICC profile present" : "No ICC profile",
          xmp: metadata.xmp ? "XMP metadata present" : "No XMP metadata",
          iptc: metadata.iptc ? "IPTC data present" : "No IPTC data",
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
        };

        // Compute suspicion signals from metadata
        const suspicionSignals: string[] = [];
        if (!metadata.exif) suspicionSignals.push("No EXIF data — may indicate screenshot or AI generation");
        if (metadata.density && metadata.density > 300) suspicionSignals.push("Unusually high DPI — common in edited images");
        if (metadata.hasAlpha) suspicionSignals.push("Alpha channel present — may indicate compositing");
        if (!metadata.icc) suspicionSignals.push("Missing color profile — common in processed images");
        if (metadata.xmp) suspicionSignals.push("XMP metadata present — check editing software history");

        imageSummary = `
File: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)
Format: ${metadata.format}, ${metadata.width}x${metadata.height}px
Color space: ${metadata.space}, ${metadata.channels} channels
EXIF: ${metadata.exif ? "Present" : "MISSING"}
ICC Profile: ${metadata.icc ? "Present" : "MISSING"}
XMP (editing history): ${metadata.xmp ? "Present" : "Absent"}
Alpha channel: ${metadata.hasAlpha ? "Yes (compositing possible)" : "No"}
Compression: ${metadata.isProgressive ? "Progressive" : "Standard"} ${metadata.chromaSubsampling ? `(${metadata.chromaSubsampling})` : ""}
Initial suspicion signals: ${suspicionSignals.length > 0 ? suspicionSignals.join("; ") : "None detected at metadata level"}
        `.trim();
      } catch (err) {
        imageSummary = `File: ${req.file.originalname} — metadata extraction failed (${req.file.mimetype})`;
      }
    } else if (url) {
      imageSummary = `URL provided for analysis: ${url}\nNote: URL-based analysis checks domain reputation and URL structure only — no pixel analysis.`;
      
      // Check URL for suspicious patterns
      const suspiciousPatterns = [
        { pattern: /bit\.ly|tinyurl|t\.co/i, flag: "URL shortener detected — hides true destination" },
        { pattern: /sebi|rbi|nse|bse/i, flag: "Claims to be from official financial regulator" },
        { pattern: /free|bonus|profit|guaranteed|returns/i, flag: "Financial inducement keywords in URL" },
        { pattern: /\.ru|\.tk|\.ml|\.ga|\.cf/i, flag: "Suspicious TLD associated with scam domains" },
      ];
      
      const urlFlags = suspiciousPatterns
        .filter(({ pattern }) => pattern.test(url))
        .map(({ flag }) => flag);
      
      if (urlFlags.length > 0) {
        metadataReport.urlFlags = urlFlags;
        imageSummary += `\nURL flags: ${urlFlags.join("; ")}`;
      }
    }

    // Run LLM analysis
    const completion = await ai.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: DEEPFAKE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this media for authenticity and potential financial scam use:\n\n${imageSummary}\n\nRespond ONLY with valid JSON.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const rawResponse = completion.choices[0]?.message?.content || "{}";
    let result: any;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);
    } catch {
      result = {
        verdict: "INSUFFICIENT_DATA",
        confidence: 30,
        c2paPresent: false,
        manipulationIndicators: [],
        metadataFlags: [],
        authenticitySignals: [],
        scamCategory: null,
        explanation: "Could not fully analyze the media. Please try with a different file.",
        recommendation: "Verify the source of this media directly with the claimed organization.",
      };
    }

    res.json({
      engine: "satyacheck-media-v1",
      analyzedAt: new Date().toISOString(),
      metadata: metadataReport,
      ...result,
    });
  })
);

export default router;
