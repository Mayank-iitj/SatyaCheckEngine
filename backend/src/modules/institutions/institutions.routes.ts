import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { registerInstitutionOnChain } from "../../lib/blockchain";
import { BadRequestError, NotFoundError } from "../../lib/errors";

const router = Router();

/**
 * POST /api/institutions/apply
 * University submits onboarding application
 */
router.post("/apply", authenticate, requireRole("UNIVERSITY"), async (req: Request, res: Response) => {
  try {
    const institution = await prisma.institution.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) {
      res.status(404).json({ error: "Institution profile not found" });
    return;
    }

    if (institution.verified) {
      res.status(400).json({ error: "Institution already verified" });
    return;
    }

    // Update with additional details
    const { description, logoUrl, walletAddress } = req.body;

    const updated = await prisma.institution.update({
      where: { id: institution.id },
      data: {
        description: description || institution.description,
        logoUrl: logoUrl || institution.logoUrl,
        walletAddress: walletAddress || institution.walletAddress,
      },
    });

    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "INSTITUTION_APPLICATION_SUBMITTED",
        entityType: "Institution",
        entityId: institution.id,
      },
    });

    res.json({ institution: updated, message: "Application submitted for review" });
    return;
  } catch (error: any) {
    console.error("Institution apply error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

/**
 * GET /api/institutions
 * List all institutions (with optional filter)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { verified } = req.query;
    const where: any = {};
    if (verified !== undefined) {
      where.verified = verified === "true";
    }

    const institutions = await prisma.institution.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { credentials: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(institutions);
    return;
  } catch (error: any) {
    console.error("List institutions error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

/**
 * PATCH /api/admin/institutions/:id
 * Admin approves or rejects an institution
 */
router.patch("/:id/approve", authenticate, requireRole("ADMIN"), async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { approved, walletAddress } = req.body;

    const institution = await prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      res.status(404).json({ error: "Institution not found" });
    return;
    }

    const updated = await prisma.institution.update({
      where: { id },
      data: {
        verified: approved === true,
        walletAddress: walletAddress || institution.walletAddress,
      },
    });

    // If approved and has a wallet address, register on-chain
    if (approved && updated.walletAddress) {
      try {
        await registerInstitutionOnChain(updated.walletAddress, updated.name);
      } catch (err) {
        console.warn("On-chain registration failed (non-fatal):", err);
      }
    }

    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: approved ? "INSTITUTION_APPROVED" : "INSTITUTION_REJECTED",
        entityType: "Institution",
        entityId: id,
        metadata: { approved },
      },
    });

    return res.json({
      institution: updated,
      message: approved ? "Institution approved" : "Institution rejected",
    });
  } catch (error: any) {
    console.error("Approve institution error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

/**
 * GET /api/institutions/:id
 * Get institution details
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const institution = await prisma.institution.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { credentials: true } },
      },
    });

    if (!institution) {
      res.status(404).json({ error: "Institution not found" });
    return;
    }

    res.json(institution);
    return;
  } catch (error: any) {
    console.error("Get institution error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
});

/**
 * POST /api/institutions/stake
 * University adds to their reputation stake bond
 */
router.post(
  "/stake",
  authenticate,
  requireRole("UNIVERSITY"),
  asyncHandler(async (req: Request, res: Response) => {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new BadRequestError("Valid positive amount required");
    }

    const institution = await prisma.institution.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) throw new NotFoundError("Institution not found");

    const updated = await prisma.institution.update({
      where: { id: institution.id },
      data: {
        stakeBond: { increment: parseFloat(amount) },
        reputationScore: { increment: 2 }, // Small rep bump for staking
      },
    });

    res.json({
      message: `Successfully staked ${amount}. Total bond is now ${updated.stakeBond}.`,
      institution: updated,
    });
  })
);

/**
 * POST /api/institutions/:id/slash
 * Admin slashes an institution for fraudulent activity
 */
router.post(
  "/:id/slash",
  authenticate,
  requireRole("ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const { reason, slashAmount } = req.body;
    
    const institution = await prisma.institution.findUnique({
      where: { id: req.params.id as string },
    });

    if (!institution) throw new NotFoundError("Institution not found");

    const amount = parseFloat(slashAmount) || Math.min(institution.stakeBond, 100);

    const updated = await prisma.institution.update({
      where: { id: institution.id },
      data: {
        stakeBond: { decrement: amount },
        slashCount: { increment: 1 },
        reputationScore: { decrement: 15 }, // Major rep hit
      },
    });

    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "INSTITUTION_SLASHED",
        entityType: "Institution",
        entityId: institution.id,
        metadata: { reason, amount, newReputation: updated.reputationScore },
      },
    });

    res.json({
      message: `Institution slashed by ${amount}. Reason: ${reason || "Fraudulent activity"}`,
      institution: updated,
    });
  })
);

export default router;
