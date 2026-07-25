import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { BadRequestError, NotFoundError } from "../../lib/errors";

const router = Router();

/**
 * POST /api/skills/profile
 * Student creates or updates their composite skill profile
 */
router.post(
  "/profile",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, bio, isPublic } = req.body;

    const profile = await prisma.skillProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        title: title || undefined,
        bio: bio || undefined,
        isPublic: isPublic !== undefined ? isPublic : undefined,
      },
      create: {
        userId: req.user!.id,
        title: title || "My Skill Profile",
        bio: bio || null,
        isPublic: isPublic !== undefined ? isPublic : true,
      },
      include: {
        entries: {
          include: {
            credential: {
              select: {
                id: true,
                title: true,
                credentialType: true,
                status: true,
                institution: { select: { name: true, reputationScore: true } },
              },
            },
          },
        },
      },
    });

    res.json(profile);
  })
);

/**
 * POST /api/skills/profile/add
 * Add a credential to the student's skill stack
 */
router.post(
  "/profile/add",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { credentialId, skillTag, weight } = req.body;

    if (!credentialId || !skillTag) {
      throw new BadRequestError("credentialId and skillTag are required");
    }

    // Verify credential belongs to the student
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
      include: { institution: { select: { reputationScore: true } } },
    });

    if (!credential) throw new NotFoundError("Credential not found");
    if (credential.studentId !== req.user!.id) {
      throw new BadRequestError("Can only add your own credentials");
    }
    if (credential.status !== "VALID") {
      throw new BadRequestError("Can only stack valid credentials");
    }

    // Ensure profile exists
    let profile = await prisma.skillProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      profile = await prisma.skillProfile.create({
        data: { userId: req.user!.id },
      });
    }

    // Add entry
    const entry = await prisma.skillProfileEntry.upsert({
      where: {
        profileId_credentialId: {
          profileId: profile.id,
          credentialId,
        },
      },
      update: { skillTag, weight: parseFloat(weight) || 1.0 },
      create: {
        profileId: profile.id,
        credentialId,
        skillTag,
        weight: parseFloat(weight) || 1.0,
      },
      include: {
        credential: {
          select: { title: true, credentialType: true },
        },
      },
    });

    // Recalculate total score
    const allEntries = await prisma.skillProfileEntry.findMany({
      where: { profileId: profile.id },
      include: {
        credential: {
          include: { institution: { select: { reputationScore: true } } },
        },
      },
    });

    const totalScore = allEntries.reduce((sum, e) => {
      const repBonus = (e.credential.institution.reputationScore || 50) / 100;
      return sum + e.weight * repBonus * 10;
    }, 0);

    await prisma.skillProfile.update({
      where: { id: profile.id },
      data: { totalScore: Math.round(totalScore * 10) / 10 },
    });

    res.json({ entry, totalScore: Math.round(totalScore * 10) / 10 });
  })
);

/**
 * GET /api/skills/profile/:userId
 * View a student's stacked skill profile (public if isPublic=true)
 */
router.get(
  "/profile/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const profile = await prisma.skillProfile.findUnique({
      where: { userId: req.params.userId as string },
      include: {
        user: { select: { name: true, email: true } },
        entries: {
          include: {
            credential: {
              select: {
                id: true,
                title: true,
                credentialType: true,
                status: true,
                issueDate: true,
                expiryDate: true,
                expiryStatus: true,
                credentialHash: true,
                institution: { select: { name: true, country: true, reputationScore: true } },
              },
            },
          },
          orderBy: { weight: "desc" },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ error: "Skill profile not found" });
      return;
    }

    if (!profile.isPublic) {
      res.status(403).json({ error: "This skill profile is private" });
      return;
    }

    // Group by skill tag for visualization
    const skillMap: Record<string, { credentials: any[]; totalWeight: number }> = {};
    for (const entry of profile.entries) {
      if (!skillMap[entry.skillTag]) {
        skillMap[entry.skillTag] = { credentials: [], totalWeight: 0 };
      }
      skillMap[entry.skillTag].credentials.push(entry.credential);
      skillMap[entry.skillTag].totalWeight += entry.weight;
    }

    res.json({
      profile: {
        id: profile.id,
        title: profile.title,
        bio: profile.bio,
        totalScore: profile.totalScore,
        owner: profile.user,
        credentialCount: profile.entries.length,
      },
      skills: Object.entries(skillMap).map(([tag, data]) => ({
        skillTag: tag,
        credentialCount: data.credentials.length,
        totalWeight: data.totalWeight,
        credentials: data.credentials,
      })),
    });
  })
);

export default router;
