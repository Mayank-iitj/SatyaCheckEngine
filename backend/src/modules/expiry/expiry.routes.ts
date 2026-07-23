import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";

const router = Router();

/**
 * Compute the expiry status of a credential based on its expiryDate.
 */
function computeExpiryStatus(expiryDate: Date | null): string {
  if (!expiryDate) return "ACTIVE";

  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) return "EXPIRED";
  if (daysUntilExpiry <= 90) return "EXPIRING_SOON";
  return "ACTIVE";
}

/**
 * GET /api/expiry/check
 * Scan all credentials for the authenticated user and flag expirations
 */
router.get(
  "/check",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const where: any = {};
    if (req.user!.role === "STUDENT") {
      where.studentId = req.user!.id;
    } else if (req.user!.role === "UNIVERSITY") {
      const inst = await prisma.institution.findUnique({ where: { userId: req.user!.id } });
      if (inst) where.institutionId = inst.id;
    }
    // ADMIN sees all

    const credentials = await prisma.credential.findMany({
      where: { ...where, expiryDate: { not: null } },
      include: {
        institution: { select: { name: true } },
        student: { select: { name: true, email: true } },
      },
    });

    const results = [];
    let updated = 0;

    for (const cred of credentials) {
      const newStatus = computeExpiryStatus(cred.expiryDate);

      if (newStatus !== cred.expiryStatus) {
        await prisma.credential.update({
          where: { id: cred.id },
          data: { expiryStatus: newStatus },
        });
        updated++;
      }

      const daysLeft = cred.expiryDate
        ? Math.ceil(
            (cred.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : null;

      results.push({
        id: cred.id,
        title: cred.title,
        credentialType: cred.credentialType,
        recipientName: cred.recipientName,
        studentEmail: cred.student.name,
        institution: cred.institution.name,
        expiryDate: cred.expiryDate,
        daysUntilExpiry: daysLeft,
        expiryStatus: newStatus,
        needsRenewal: newStatus === "EXPIRED" || newStatus === "NEEDS_RENEWAL",
      });
    }

    const summary = {
      total: results.length,
      active: results.filter((r) => r.expiryStatus === "ACTIVE").length,
      expiringSoon: results.filter((r) => r.expiryStatus === "EXPIRING_SOON").length,
      expired: results.filter((r) => r.expiryStatus === "EXPIRED").length,
      needsRenewal: results.filter((r) => r.needsRenewal).length,
      statusesUpdated: updated,
    };

    res.json({ summary, credentials: results });
  })
);

/**
 * GET /api/expiry/notifications
 * Student's expiry alerts (credentials expiring within 90 days or already expired)
 */
router.get(
  "/notifications",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const expiring = await prisma.credential.findMany({
      where: {
        studentId: req.user!.id,
        status: "VALID",
        expiryDate: { not: null, lte: ninetyDaysFromNow },
      },
      include: {
        institution: { select: { name: true } },
      },
      orderBy: { expiryDate: "asc" },
    });

    const alerts = expiring.map((cred) => {
      const daysLeft = cred.expiryDate
        ? Math.ceil(
            (cred.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      return {
        credentialId: cred.id,
        title: cred.title,
        institution: cred.institution.name,
        expiryDate: cred.expiryDate,
        daysUntilExpiry: daysLeft,
        severity: daysLeft < 0 ? "CRITICAL" : daysLeft <= 30 ? "HIGH" : "MEDIUM",
        message:
          daysLeft < 0
            ? `Your "${cred.title}" has EXPIRED ${Math.abs(daysLeft)} days ago. Contact ${cred.institution.name} for renewal.`
            : `Your "${cred.title}" expires in ${daysLeft} days. Consider renewing with ${cred.institution.name}.`,
      };
    });

    res.json({ alerts, count: alerts.length });
  })
);

export default router;
