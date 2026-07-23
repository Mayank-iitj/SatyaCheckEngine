import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { verifyCredentialOnChain } from "../../lib/blockchain";
import { optionalAuth } from "../../middleware/auth";
import { v4 as uuidv4 } from "uuid";
import { authenticate } from "../../middleware/auth";
import { computeFraudScore } from "../fraud/fraud.routes";
import { createVerificationReceipt } from "../notifications/notifications.routes";

const router = Router();

/**
 * POST /api/verify
 * Public credential verification — no auth required
 * Accepts: { credentialId, hash, qrPayload }
 */
router.post("/", optionalAuth, async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { credentialId, hash, qrPayload } = req.body;
    let queryHash: string | null = null;
    let queryType: string = "unknown";

    // Determine the hash to look up
    if (hash) {
      queryHash = hash;
      queryType = "hash";
    } else if (credentialId) {
      // Look up by credential ID to get the hash
      const cred = await prisma.credential.findUnique({
        where: { id: credentialId },
      });
      if (cred) {
        queryHash = cred.credentialHash;
      }
      queryType = "id";
    } else if (qrPayload) {
      // Parse QR payload (URL format: /verify?hash=...&id=...)
      try {
        const url = new URL(qrPayload);
        queryHash = url.searchParams.get("hash") || null;
      } catch {
        // Try as raw hash
        queryHash = qrPayload;
      }
      queryType = "qr";
    }

    if (!queryHash) {
      // Log failed attempt
      await prisma.verificationLog.create({
        data: {
          requesterIp: req.ip || req.socket.remoteAddress,
          requesterId: req.user?.id,
          queryType,
          result: "NOT_FOUND",
          responseTime: Date.now() - startTime,
        },
      });

      return res.status(400).json({
        status: "NOT_FOUND",
        message: "No valid credential identifier provided",
      });
    }

    // Look up in database
    const credential = await prisma.credential.findUnique({
      where: { credentialHash: queryHash },
      include: {
        institution: {
          select: { id: true, name: true, country: true, logoUrl: true, verified: true },
        },
        student: {
          select: { name: true },
        },
      },
    });

    // Also check on-chain
    const chainResult = await verifyCredentialOnChain(queryHash);

    if (!credential) {
      await prisma.verificationLog.create({
        data: {
          requesterIp: req.ip || req.socket.remoteAddress,
          requesterId: req.user?.id,
          queryHash,
          queryType,
          result: "NOT_FOUND",
          responseTime: Date.now() - startTime,
        },
      });

      return res.json({
        status: "NOT_FOUND",
        message: "No credential found with this hash. This may be a forged or invalid credential.",
        hash: queryHash,
        onChain: chainResult,
      });
    }

    // Determine final status
    const isRevoked = credential.status === "REVOKED" || chainResult?.revoked === true;
    const resultStatus = isRevoked ? "REVOKED" : "VALID";

    // Log verification with fraud score
    const fraudScore = await computeFraudScore(queryHash);

    await prisma.verificationLog.create({
      data: {
        credentialId: credential.id,
        requesterIp: req.ip || req.socket.remoteAddress,
        requesterId: req.user?.id,
        queryHash,
        queryType,
        result: resultStatus,
        responseTime: Date.now() - startTime,
        fraudRiskScore: fraudScore,
      },
    });

    // Create verification receipt (consent-based notification)
    await createVerificationReceipt(
      credential.id,
      credential.studentId,
      req.ip || req.socket.remoteAddress || null,
      req.user?.name || null,
      req.user?.role || "ANONYMOUS",
      queryType
    );

    // Update platform stats
    await prisma.platformStats.upsert({
      where: { id: "global" },
      update: { credentialsVerified: { increment: 1 } },
      create: { id: "global", credentialsVerified: 1 },
    });

    return res.json({
      status: resultStatus,
      message: isRevoked
        ? "This credential has been revoked by the issuing institution."
        : "Credential verified successfully. This is an authentic credential.",
      credential: {
        id: credential.id,
        title: credential.title,
        credentialType: credential.credentialType,
        recipientName: credential.recipientName,
        issueDate: credential.issueDate,
        credentialHash: credential.credentialHash,
        txHash: credential.txHash,
        status: credential.status,
        revokedReason: credential.revokedReason,
        revokedAt: credential.revokedAt,
      },
      institution: credential.institution,
      onChain: chainResult
        ? {
            exists: chainResult.exists,
            revoked: chainResult.revoked,
            issuer: chainResult.issuer,
            timestamp: chainResult.timestamp,
            blockExplorerUrl: credential.txHash
              ? `https://amoy.polygonscan.com/tx/${credential.txHash}`
              : null,
          }
        : null,
      verifiedAt: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      fraudRiskScore: fraudScore,
      expiryStatus: credential.expiryDate
        ? {
            expiryDate: credential.expiryDate,
            daysUntilExpiry: Math.ceil(
              ((credential.expiryDate as Date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ),
            status: (credential as any).expiryStatus || "ACTIVE",
          }
        : null,
    });
  } catch (error: any) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/verify/bulk
 * Bulk verification — accepts array of hashes
 */
router.post("/bulk", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { hashes } = req.body;
    if (!Array.isArray(hashes) || hashes.length === 0) {
      return res.status(400).json({ error: "Provide an array of hashes" });
    }

    if (hashes.length > 100) {
      return res.status(400).json({ error: "Maximum 100 hashes per bulk request" });
    }

    const results = await Promise.all(
      hashes.map(async (hash: string) => {
        const credential = await prisma.credential.findUnique({
          where: { credentialHash: hash },
          include: {
            institution: { select: { name: true } },
            student: { select: { name: true } },
          },
        });

        if (!credential) {
          return { hash, status: "NOT_FOUND", credential: null };
        }

        return {
          hash,
          status: credential.status,
          credential: {
            title: credential.title,
            recipientName: credential.recipientName,
            institutionName: credential.institution.name,
            issueDate: credential.issueDate,
            credentialType: credential.credentialType,
          },
        };
      })
    );

    return res.json({
      total: hashes.length,
      verified: results.filter((r) => r.status === "VALID").length,
      notFound: results.filter((r) => r.status === "NOT_FOUND").length,
      revoked: results.filter((r) => r.status === "REVOKED").length,
      results,
    });
  } catch (error: any) {
    console.error("Bulk verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/verify/share/:token
 * Resolve a share link (no auth required)
 */
router.get("/share/:token", async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;
    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        credential: {
          include: {
            institution: { select: { name: true, country: true, logoUrl: true } },
          },
        },
      },
    });

    if (!shareLink) {
      return res.status(404).json({ error: "Share link not found" });
    }

    // Check expiry
    if (new Date() > shareLink.expiresAt) {
      return res.status(410).json({ error: "Share link has expired" });
    }

    // Check single-use
    if (shareLink.singleUse && shareLink.usedAt) {
      return res.status(410).json({ error: "Share link has already been used" });
    }

    // Mark as used if single-use
    if (shareLink.singleUse) {
      await prisma.shareLink.update({
        where: { id: shareLink.id },
        data: { usedAt: new Date() },
      });
    }

    return res.json({
      credential: {
        title: shareLink.credential.title,
        credentialType: shareLink.credential.credentialType,
        recipientName: shareLink.credential.recipientName,
        issueDate: shareLink.credential.issueDate,
        credentialHash: shareLink.credential.credentialHash,
        status: shareLink.credential.status,
        institution: shareLink.credential.institution,
      },
    });
  } catch (error: any) {
    console.error("Share link resolve error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
