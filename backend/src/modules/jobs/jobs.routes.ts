import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { BadRequestError } from "../../lib/errors";
import { ai } from "../../lib/ai";

const router = Router();

/**
 * POST /api/jobs
 * Recruiter creates a job posting with required qualifications
 */
router.post(
  "/",
  authenticate,
  requireRole("RECRUITER", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const {
      title, company, location, description,
      requiredCredTypes, requiredKeywords,
      minReputationScore, salaryRange,
    } = req.body;

    if (!title || !company || !location || !description) {
      throw new BadRequestError("title, company, location, and description are required");
    }

    const job = await prisma.jobPosting.create({
      data: {
        recruiterId: req.user!.id,
        title,
        company,
        location,
        description,
        requiredCredTypes: requiredCredTypes || "DEGREE",
        requiredKeywords: requiredKeywords || "",
        minReputationScore: parseFloat(minReputationScore) || 0,
        salaryRange: salaryRange || null,
      },
    });

    // Update platform stats
    await prisma.platformStats.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global" },
    });

    res.status(201).json(job);
  })
);

/**
 * GET /api/jobs
 * List open job postings
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const jobs = await prisma.jobPosting.findMany({
      where: { isActive: true },
      include: {
        recruiter: { select: { name: true, email: true } },
        _count: { select: { matches: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(jobs);
  })
);

/**
 * GET /api/jobs/matches
 * AI engine: reads a student's verified credentials and matches to open roles using Gemini AI
 */
router.get(
  "/matches",
  authenticate,
  requireRole("STUDENT"),
  asyncHandler(async (req: Request, res: Response) => {
    // 1. Get all of the student's valid credentials
    const credentials = await prisma.credential.findMany({
      where: { studentId: req.user!.id, status: "VALID" },
      include: {
        institution: { select: { name: true, reputationScore: true, country: true } },
      },
    });

    if (credentials.length === 0) {
      res.json({ matches: [], message: "No verified credentials found to match against" });
    return;
    }

    // 2. Build student profile summary
    const studentCredTypes = new Set(credentials.map((c) => c.credentialType));
    const avgReputation =
      credentials.reduce((sum, c) => sum + (c.institution.reputationScore || 0), 0) /
      credentials.length;

    const studentProfileStr = credentials.map(c => 
      `- ${c.credentialType}: ${c.title} from ${c.institution.name} (Reputation: ${c.institution.reputationScore}). Description: ${c.description || "N/A"}`
    ).join("\n");

    // 3. Get all active jobs
    const jobs = await prisma.jobPosting.findMany({
      where: { isActive: true },
      include: { recruiter: { select: { name: true } } }, // NOTE: user doesn't have 'company' on User model. We'll omit company or fetch it if needed. Wait, job itself has company!
    });

    if (jobs.length === 0) {
      res.json({ matches: [], message: "No active jobs available" });
    return;
    }

    // 4. Score each job using Gemini AI
    
    // We construct a prompt asking Gemini to evaluate all jobs at once to save latency,
    // returning a JSON array of matches.
    const jobsPrompt = jobs.map(j => 
      `Job ID [${j.id}]: ${j.title} at ${j.company}.\nDescription: ${j.description}\nRequired Types: ${j.requiredCredTypes}\nKeywords: ${j.requiredKeywords}\nMin Reputation: ${j.minReputationScore}`
    ).join("\n\n");

    const prompt = `
You are an expert technical recruiter AI.
Evaluate the following student's credential portfolio against a list of open job postings.
For each job, determine how well the student matches the job requirements based on their credentials, skills, and institution reputation.
Calculate a match score between 0 and 100.
Only include jobs where the match score is greater than 20.

Student Portfolio:
${studentProfileStr}
Average Institution Reputation: ${avgReputation.toFixed(1)}

Job Postings:
${jobsPrompt}

You MUST return the output in strict JSON format. Return a JSON object with a single key "matches". The value should be an array of objects, where each object has:
- "jobId" (string)
- "matchScore" (integer)
- "matchReasons" (array of 2-3 specific string reasons)
`;

    let aiResults: { jobId: string; matchScore: number; matchReasons: string[] }[] = [];

    try {
      const response = await ai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });
      
      const text = response.choices[0]?.message?.content || "";
      if (text) {
        const parsed = JSON.parse(text);
        aiResults = parsed.matches || [];
      }
    } catch (error) {
      console.error("Gemini AI matching failed (falling back to local engine):", (error as any).message);
      // Fallback to local heuristic engine if API fails
      const studentKeywords = studentProfileStr.toLowerCase();
      
      aiResults = jobs.map(job => {
        const reasons: string[] = [];
        let score = 0;

        const requiredTypes = job.requiredCredTypes.split(",").map((t) => t.trim());
        const typeMatches = requiredTypes.filter((t) => studentCredTypes.has(t));
        if (typeMatches.length > 0) {
          score += (typeMatches.length / requiredTypes.length) * 40;
          reasons.push(`[Local AI] Credential types match: ${typeMatches.join(", ")}`);
        }

        const requiredKeywords = job.requiredKeywords.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean);
        const keywordMatches = requiredKeywords.filter((k) => studentKeywords.includes(k));
        if (keywordMatches.length > 0 || requiredKeywords.length === 0) {
          score += requiredKeywords.length > 0 ? (keywordMatches.length / requiredKeywords.length) * 40 : 20;
          if (keywordMatches.length > 0) reasons.push(`[Local AI] Skills match: ${keywordMatches.join(", ")}`);
        }

        if (avgReputation >= job.minReputationScore) {
          score += 20;
          reasons.push(`[Local AI] Institution reputation meets threshold`);
        }

        return {
          jobId: job.id,
          matchScore: Math.round(Math.min(score, 100)),
          matchReasons: reasons.length > 0 ? reasons : ["[Local AI] Partial match based on profile overview"],
        };
      }).filter(m => m.matchScore > 20);
    }

    // Map AI results back to our job objects and filter valid ones
    const matches = aiResults.map(aiMatch => {
      const job = jobs.find(j => j.id === aiMatch.jobId);
      if (!job) return null;
      return {
        job: {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          salaryRange: job.salaryRange,
          recruiter: (job as any).recruiter,
        },
        matchScore: aiMatch.matchScore,
        matchReasons: aiMatch.matchReasons,
      };
    }).filter(m => m !== null) as any[];

    // Sort by highest score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // 5. Save matches to DB
    for (const match of matches) {
      await prisma.jobMatch.upsert({
        where: {
          jobId_studentId: { jobId: match.job.id, studentId: req.user!.id },
        },
        update: { matchScore: match.matchScore, matchReasons: match.matchReasons },
        create: {
          jobId: match.job.id,
          studentId: req.user!.id,
          matchScore: match.matchScore,
          matchReasons: match.matchReasons,
        },
      });
    }

    res.json({
      studentProfile: {
        credentialCount: credentials.length,
        credentialTypes: Array.from(studentCredTypes),
        avgInstitutionReputation: avgReputation.toFixed(1),
      },
      matches,
      totalJobs: jobs.length,
      matchedJobs: matches.length,
    });
  })
);

export default router;
