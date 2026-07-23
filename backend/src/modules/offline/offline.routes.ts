import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/offline/bundle
 * Download verification bundle for offline verification
 * Includes public keys, recent Merkle roots, and latest revoked hashes
 */
router.get(
  "/bundle",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    // 1. Get verified institutions and their public keys
    const institutions = await prisma.institution.findMany({
      where: { verified: true },
      select: { id: true, name: true, publicKey: true, reputationScore: true },
    });

    // 2. Get recent Merkle roots for batch issuance
    const recentCredentials = await prisma.credential.findMany({
      where: { merkleRoot: { not: null } },
      select: { merkleRoot: true },
      distinct: ["merkleRoot"],
      take: 100,
      orderBy: { createdAt: "desc" },
    });
    const merkleRoots = recentCredentials.map((c) => c.merkleRoot);

    // 3. Get list of revoked credential hashes
    const revoked = await prisma.credential.findMany({
      where: { status: "REVOKED" },
      select: { credentialHash: true },
    });
    const revokedHashes = revoked.map((c) => c.credentialHash);

    res.json({
      timestamp: new Date().toISOString(),
      institutions,
      merkleRoots,
      revokedHashes,
      signature: "VALID_BUNDLE_SIG", // In production, this bundle would be signed by the platform
    });
  })
);

/**
 * POST /api/offline/sync
 * Sync offline verifications back to the server
 */
router.post(
  "/sync",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { verifications } = req.body;

    if (!Array.isArray(verifications)) {
      return res.status(400).json({ error: "verifications must be an array" });
    }

    let syncedCount = 0;

    for (const v of verifications) {
      if (v.credentialId && v.result) {
        await prisma.verificationLog.create({
          data: {
            credentialId: v.credentialId,
            requesterId: req.user!.id,
            requesterIp: "OFFLINE_SYNC",
            queryHash: v.queryHash,
            queryType: "offline_qr",
            result: v.result,
            responseTime: v.responseTime || 0,
            createdAt: v.timestamp ? new Date(v.timestamp) : new Date(),
          },
        });
        syncedCount++;
      }
    }

    // Update global stats
    if (syncedCount > 0) {
      await prisma.platformStats.upsert({
        where: { id: "global" },
        update: { credentialsVerified: { increment: syncedCount } },
        create: { id: "global", credentialsVerified: syncedCount },
      });
    }

    res.json({
      message: `Successfully synced ${syncedCount} offline verifications`,
      syncedCount,
    });
  })
);

export default router;
