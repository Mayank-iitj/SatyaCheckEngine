import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { NotFoundError } from "../../lib/errors";
import { ai } from "../../lib/ai";
import { Type, Schema } from "@google/genai";

const router = Router();

/**
 * POST /api/equivalency/map
 * AI maps a foreign degree to equivalent local qualification framework using Gemini AI
 */
router.post(
  "/map",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { credentialId, targetCountry } = req.body;

    if (!credentialId) {
      return res.status(400).json({ error: "credentialId is required" });
    }

    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      include: { institution: { select: { name: true, country: true } } },
    });

    if (!credential) {
      throw new NotFoundError("Credential not found");
    }

    const sourceCountry = credential.institution.country;
    const target = targetCountry || "United States";

    const prompt = `
You are an expert international credential evaluator.
Map the following foreign academic qualification to the closest equivalent framework in the target country.

Source Country: ${sourceCountry}
Source Institution: ${credential.institution.name}
Credential Type: ${credential.credentialType}
Credential Title: ${credential.title}

Target Country: ${target}

Determine the closest equivalent qualification framework in the target country (e.g., "Bachelor of Science (BS)", "Master's Degree (MS)", "Associate Degree", etc.).
Provide a confidence score from 0 to 100 for this equivalency mapping.
Provide detailed reasoning based on international education standards and agreements (e.g., Bologna Process, Washington Accord, etc.).
`;

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        targetFramework: { type: Type.STRING },
        confidenceScore: { type: Type.INTEGER },
        details: { type: Type.STRING }
      },
      required: ["targetFramework", "confidenceScore", "details"]
    };

    let aiResult = {
      targetFramework: "Requires manual evaluation",
      confidenceScore: 60,
      details: "No specific equivalency could be determined by AI. A formal credential evaluation service is recommended."
    };

    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      
      const text = result.text();
      if (text) {
        aiResult = JSON.parse(text);
      }
    } catch (error) {
      console.error("Gemini AI equivalency mapping failed (falling back to local engine):", (error as any).message);
      
      const genericMap: Record<string, string> = {
        DEGREE: "Equivalent Bachelor's/Master's Degree",
        DIPLOMA: "Equivalent Diploma/Associate Degree",
        CERTIFICATE: "Professional Certificate (recognized)",
        MICRO_CREDENTIAL: "Continuing Education Credit",
        TRANSCRIPT: "Academic Record (for evaluation)",
      };

      aiResult = {
        targetFramework: genericMap[credential.credentialType] || "Requires manual evaluation",
        confidenceScore: 70,
        details: `[Local AI Fallback] No specific equivalency could be determined by AI for '${credential.title}'. This is a general mapping based on the credential type '${credential.credentialType}'.`
      };
    }

    const mapping = await prisma.equivalencyMapping.create({
      data: {
        credentialId: credential.id,
        sourceCountry,
        sourceFramework: `${credential.credentialType}: ${credential.title}`,
        targetCountry: target,
        targetFramework: aiResult.targetFramework,
        confidenceScore: aiResult.confidenceScore,
        details: {
          method: "gemini_ai_evaluation",
          reasoning: aiResult.details,
          sourceInstitution: credential.institution.name,
          institutionCountry: sourceCountry,
        },
      },
    });

    res.json({
      mapping,
      confidence: aiResult.confidenceScore >= 90 ? "HIGH" : aiResult.confidenceScore >= 75 ? "MEDIUM" : "LOW",
      summary: `"${credential.title}" from ${credential.institution.name} (${sourceCountry}) ≈ "${aiResult.targetFramework}" in ${target}`,
    });
  })
);

/**
 * GET /api/equivalency/:credentialId
 * Get equivalency mappings for a specific credential
 */
router.get(
  "/:credentialId",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const mappings = await prisma.equivalencyMapping.findMany({
      where: { credentialId: req.params.credentialId },
      orderBy: { confidenceScore: "desc" },
    });

    res.json(mappings);
  })
);

export default router;
