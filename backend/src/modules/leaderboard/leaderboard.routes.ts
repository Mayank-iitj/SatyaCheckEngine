import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";

const router = Router();

/**
 * GET /api/leaderboard/stats
 * Public endpoint — no auth required. Returns live platform statistics
 * for the landing page counter: "X credentials verified, Y institutions..."
 */
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    // Upsert global stats (create if not exists)
    let stats = await prisma.platformStats.findUnique({
      where: { id: "global" },
    });

    if (!stats) {
      stats = await prisma.platformStats.create({
        data: { id: "global" },
      });
    }

    // Get real-time counts to supplement seeded base numbers
    const [realCredentials, realVerifications, realInstitutions, realUsers] =
      await Promise.all([
        prisma.credential.count(),
        prisma.verificationLog.count(),
        prisma.institution.count({ where: { verified: true } }),
        prisma.user.count(),
      ]);

    // Combine seeded base with real data
    res.json({
      credentialsVerified: stats.credentialsVerified + realVerifications,
      institutionsOnboarded: stats.institutionsOnboarded + realInstitutions,
      fraudBlocked: stats.fraudBlocked,
      countriesCovered: stats.countriesCovered,
      credentialsIssued: stats.credentialsIssued + realCredentials,
      recoveryCompleted: stats.recoveryCompleted,
      jobsMatched: stats.jobsMatched,
      totalUsers: realUsers,
      lastUpdated: stats.updatedAt,
    });
  })
);

/**
 * GET /api/leaderboard/top-institutions
 * Public: top institutions by reputation and credential count
 */
router.get(
  "/top-institutions",
  asyncHandler(async (req: Request, res: Response) => {
    const institutions = await prisma.institution.findMany({
      where: { verified: true },
      include: {
        _count: { select: { credentials: true } },
      },
      orderBy: { reputationScore: "desc" },
      take: 10,
    });

    res.json(
      institutions.map((inst) => ({
        id: inst.id,
        name: inst.name,
        country: inst.country,
        reputationScore: inst.reputationScore,
        credentialsIssued: inst._count.credentials,
        tier: inst.tier,
        stakeBond: inst.stakeBond,
      }))
    );
  })
);

export default router;
