import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/analytics/overview
 * Global analytics (admin)
 */
router.get("/overview", authenticate, requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalInstitutions,
      verifiedInstitutions,
      totalCredentials,
      validCredentials,
      revokedCredentials,
      totalVerifications,
      recentVerifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.institution.count(),
      prisma.institution.count({ where: { verified: true } }),
      prisma.credential.count(),
      prisma.credential.count({ where: { status: "VALID" } }),
      prisma.credential.count({ where: { status: "REVOKED" } }),
      prisma.verificationLog.count(),
      prisma.verificationLog.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    // Verifications by result
    const verificationsByResult = await prisma.verificationLog.groupBy({
      by: ["result"],
      _count: true,
    });

    // Credentials by type
    const credentialsByType = await prisma.credential.groupBy({
      by: ["credentialType"],
      _count: true,
    });

    // Recent activity (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCredentials = await prisma.credential.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const recentVerificationLogs = await prisma.verificationLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return res.json({
      totals: {
        users: totalUsers,
        institutions: totalInstitutions,
        verifiedInstitutions,
        credentials: totalCredentials,
        validCredentials,
        revokedCredentials,
        verifications: totalVerifications,
        recentVerifications,
      },
      verificationsByResult: verificationsByResult.map((v) => ({
        result: v.result,
        count: v._count,
      })),
      credentialsByType: credentialsByType.map((c) => ({
        type: c.credentialType,
        count: c._count,
      })),
      recentActivity: {
        credentials: groupByDay(recentCredentials.map((c) => c.createdAt)),
        verifications: groupByDay(recentVerificationLogs.map((v) => v.createdAt)),
      },
    });
  } catch (error: any) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

/**
 * GET /api/analytics/institution/:id
 * Institution-specific analytics
 */
router.get("/institution/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const institution = await prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      res.status(404).json({ error: "Institution not found" });
    return;
    }

    const [totalIssued, validCount, revokedCount] = await Promise.all([
      prisma.credential.count({ where: { institutionId: id } }),
      prisma.credential.count({ where: { institutionId: id, status: "VALID" } }),
      prisma.credential.count({ where: { institutionId: id, status: "REVOKED" } }),
    ]);

    // Verification stats for this institution's credentials
    const verificationCount = await prisma.verificationLog.count({
      where: { credential: { institutionId: id } },
    });

    // Credentials by type
    const byType = await prisma.credential.groupBy({
      by: ["credentialType"],
      where: { institutionId: id },
      _count: true,
    });

    return res.json({
      institution: { id: institution.id, name: institution.name },
      stats: {
        totalIssued,
        valid: validCount,
        revoked: revokedCount,
        verifications: verificationCount,
      },
      byType: byType.map((t) => ({ type: t.credentialType, count: t._count })),
    });
  } catch (error: any) {
    console.error("Institution analytics error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

/**
 * GET /api/analytics/audit
 * Audit trail (admin)
 */
router.get("/audit", authenticate, requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const [events, total] = await Promise.all([
      prisma.auditEvent.findMany({
        include: { actor: { select: { name: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditEvent.count(),
    ]);

    res.json({ events, total, page, limit });
    return;
  } catch (error: any) {
    console.error("Audit log error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

// Helper: group dates by day
function groupByDay(dates: Date[]): { date: string; count: number }[] {
  const groups: Record<string, number> = {};
  for (const d of dates) {
    const key = d.toISOString().split("T")[0];
    groups[key] = (groups[key] || 0) + 1;
  }
  return Object.entries(groups).map(([date, count]) => ({ date, count }));
}

export default router;
