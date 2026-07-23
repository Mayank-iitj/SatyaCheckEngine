import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * POST /api/share-links
 * Student creates a share link for a credential
 */
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { credentialId, expiresInHours, singleUse } = req.body;

    if (!credentialId) {
      return res.status(400).json({ error: "credentialId is required" });
    }

    // Verify ownership
    const credential = await prisma.credential.findUnique({
      where: { id: credentialId },
    });

    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }

    if (credential.studentId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Can only share your own credentials" });
    }

    const token = uuidv4();
    const hours = Math.min(parseInt(expiresInHours) || 24, 720); // Max 30 days
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    const shareLink = await prisma.shareLink.create({
      data: {
        credentialId,
        token,
        expiresAt,
        singleUse: singleUse === true,
      },
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/share/${token}`;

    return res.status(201).json({
      shareLink,
      shareUrl,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Create share link error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
