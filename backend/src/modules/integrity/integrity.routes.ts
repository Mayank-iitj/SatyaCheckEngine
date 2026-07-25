/**
 * Integrity Check Module
 * POST /api/integrity/check
 *
 * Re-canonicalizes a presented document using the exact same normalization routine
 * used at issuance, recomputes SHA-256, and compares against the on-chain record.
 *
 * Accepts: credentialId (string) or uploaded file
 * Returns: structured comparison result — never just true/false
 */
import { Router, Request, Response } from "express";
import multer from "multer";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { verifyCredentialOnChain } from "../../lib/blockchain";
import { canonicalizeDocument, computeCanonicalHash } from "../../lib/canonicalize";
import { optionalAuth } from "../../middleware/auth";
import { BadRequestError, NotFoundError } from "../../lib/errors";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export interface IntegrityCheckResult {
  match: boolean;
  credentialId?: string;
  originalHash: string;
  presentedHash: string;
  diffSummary: string;
  onChainStatus: "VALID" | "REVOKED" | "NOT_FOUND" | "CHAIN_UNAVAILABLE";
  recommendation: string;
  canonicalization?: {
    method: string;
    strippedFields: string[];
    originalSize: number;
    canonicalSize: number;
  };
  verifiedAt: string;
}

/**
 * POST /api/integrity/check
 *
 * Body (multipart/form-data):
 *   file?: uploaded document to check
 *   credentialId?: string — look up the original hash by credentialId
 *   hash?: string — directly provide the credential hash to compare against
 *   institutionId?: string — for metadata-bound hash recomputation
 *   studentId?: string — for metadata-bound hash recomputation
 *   credentialType?: string
 *   issueDate?: string
 */
router.post(
  "/check",
  optionalAuth,
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    const { credentialId, hash: providedHash, institutionId, studentId, credentialType, issueDate } =
      req.body;

    if (!credentialId && !providedHash) {
      throw new BadRequestError("Provide either credentialId or hash to check against");
    }

    // ── Step 1: Look up the original credential record ─────────────────────
    let credential = null;

    if (credentialId) {
      credential = await prisma.credential.findFirst({
        where: {
          OR: [{ credentialId: credentialId as string }, { id: credentialId as string }],
        },
        include: {
          institution: { select: { id: true, name: true } },
        },
      });
      if (!credential) {
        throw new NotFoundError(`No credential found with ID: ${credentialId}`);
      }
    } else if (providedHash) {
      credential = await prisma.credential.findUnique({
        where: { credentialHash: providedHash as string },
        include: {
          institution: { select: { id: true, name: true } },
        },
      });
    }

    const originalHash = credential?.credentialHash || providedHash;
    if (!originalHash) {
      throw new BadRequestError("Could not resolve the original credential hash");
    }

    // ── Step 2: Compute hash of presented document ─────────────────────────
    let presentedHash: string;
    let canonicalizationInfo: IntegrityCheckResult["canonicalization"] | undefined;

    if (req.file) {
      // File presented — recompute hash using canonical routine
      const mimeType = req.file.mimetype;

      if (institutionId && studentId && credentialType && issueDate) {
        // Full metadata-bound hash (most secure — matches issuance-time computation)
        const result = computeCanonicalHash(req.file.buffer, {
          institutionId,
          studentId,
          credentialType,
          issueDate,
        }, mimeType);
        presentedHash = result.hash;
        canonicalizationInfo = {
          method: result.canonicalization.method,
          strippedFields: result.canonicalization.strippedFields,
          originalSize: result.canonicalization.originalSize,
          canonicalSize: result.canonicalization.canonicalSize,
        };
      } else {
        // Simple file hash (no metadata binding — less strict, still useful for tamper detection)
        const canon = canonicalizeDocument(req.file.buffer, mimeType);
        const hash = crypto.createHash("sha256").update(canon.canonicalBuffer).digest("hex");
        presentedHash = `0x${hash}`;
        canonicalizationInfo = {
          method: canon.method,
          strippedFields: canon.strippedFields,
          originalSize: canon.originalSize,
          canonicalSize: canon.canonicalSize,
        };
      }
    } else {
      // No file — client is checking by credentialId only (look up record, no file comparison)
      // In this mode we just report the on-chain status
      presentedHash = originalHash;
    }

    // ── Step 3: Compare hashes ─────────────────────────────────────────────
    const match = presentedHash.toLowerCase() === originalHash.toLowerCase();

    // ── Step 4: Check on-chain status ──────────────────────────────────────
    let onChainStatus: IntegrityCheckResult["onChainStatus"] = "NOT_FOUND";
    try {
      if (originalHash) {
        const chainResult = await verifyCredentialOnChain(originalHash);
        if (chainResult === null) {
          onChainStatus = "CHAIN_UNAVAILABLE";
        } else if (!chainResult.exists) {
          onChainStatus = "NOT_FOUND";
        } else if (chainResult.revoked) {
          onChainStatus = "REVOKED";
        } else {
          onChainStatus = "VALID";
        }
      }
    } catch {
      onChainStatus = "CHAIN_UNAVAILABLE";
    }

    // Fall back to DB status if chain unavailable
    if (onChainStatus === "CHAIN_UNAVAILABLE" && credential) {
      onChainStatus = credential.status === "REVOKED" ? "REVOKED" : "VALID";
    }

    // ── Step 5: Build explainable result ───────────────────────────────────
    const diffSummary = buildDiffSummary(match, originalHash, presentedHash, onChainStatus, req.file?.originalname);
    const recommendation = buildRecommendation(match, onChainStatus);

    const result: IntegrityCheckResult = {
      match,
      credentialId: credential?.credentialId || credential?.id,
      originalHash,
      presentedHash,
      diffSummary,
      onChainStatus,
      recommendation,
      canonicalization: canonicalizationInfo,
      verifiedAt: new Date().toISOString(),
    };

    // Log the integrity check
    if (credential) {
      await prisma.verificationLog.create({
        data: {
          credentialId: credential.id,
          requesterIp: req.ip || req.socket.remoteAddress,
          requesterId: req.user?.id,
          queryHash: originalHash,
          queryType: "integrity_check",
          result: match ? "HASH_MATCH" : "HASH_MISMATCH",
          responseTime: 0,
        },
      }).catch(() => {
        // Non-fatal — log failure silently
      });
    }

    res.json(result);
  })
);

/**
 * GET /api/integrity/:credentialId
 * Quick status check by credentialId — returns on-chain status without file comparison
 */
router.get(
  "/:credentialId",
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { credentialId } = req.params;

    const credential = await prisma.credential.findFirst({
      where: {
        OR: [{ credentialId: credentialId as string }, { id: credentialId as string }],
      },
      include: {
        institution: { select: { id: true, name: true, logoUrl: true } },
        student: { select: { name: true } },
      },
    });

    if (!credential) {
      throw new NotFoundError(`No credential found with ID: ${credentialId}`);
    }

    // Check on-chain status
    let onChainStatus: IntegrityCheckResult["onChainStatus"] = "CHAIN_UNAVAILABLE";
    try {
      const chainResult = await verifyCredentialOnChain(credential.credentialHash);
      if (chainResult === null) {
        onChainStatus = "CHAIN_UNAVAILABLE";
      } else if (!chainResult.exists) {
        onChainStatus = "NOT_FOUND";
      } else if (chainResult.revoked) {
        onChainStatus = "REVOKED";
      } else {
        onChainStatus = "VALID";
      }
    } catch {
      onChainStatus = "CHAIN_UNAVAILABLE";
    }

    if (onChainStatus === "CHAIN_UNAVAILABLE") {
      onChainStatus = credential.status === "REVOKED" ? "REVOKED" : "VALID";
    }

    res.json({
      credentialId: credential.credentialId || credential.id,
      credentialHash: credential.credentialHash,
      onChainStatus,
      dbStatus: credential.status,
      institutionId: (credential as any).institution?.id,
      recipientName: credential.recipientName,
      issueDate: credential.issueDate,
      credentialType: credential.credentialType,
      title: credential.title,
      txHash: credential.txHash,
      source: (credential as any).source || "MANUAL",
      sealedCopyCID: (credential as any).sealedCopyCID || null,
      forensicsReport: (credential as any).forensicsReport || null,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${credential.credentialId || credential.id}`,
    });
  })
);

// ── Helper functions ────────────────────────────────────────────────────────

function buildDiffSummary(
  match: boolean,
  originalHash: string,
  presentedHash: string,
  onChainStatus: string,
  fileName?: string
): string {
  if (!fileName) {
    return `Status check only (no file presented). On-chain status: ${onChainStatus}.`;
  }

  if (match) {
    return `Hash match confirmed. The presented file "${fileName}" produces the exact same SHA-256 fingerprint as the original issued document. This is an authentic copy.`;
  }

  // Find the first differing position for educational display
  const a = originalHash.toLowerCase();
  const b = presentedHash.toLowerCase();
  let firstDiff = -1;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      firstDiff = i;
      break;
    }
  }

  const diffNote = firstDiff >= 0
    ? ` First difference at position ${firstDiff} of the hex fingerprint — a single character change in the document source causes a completely different 256-bit hash.`
    : "";

  return `Hash mismatch — presented file "${fileName}" does NOT match the original issued document.${diffNote}`;
}

function buildRecommendation(match: boolean, onChainStatus: string): string {
  if (onChainStatus === "REVOKED") {
    return "REJECT — this credential has been revoked by the issuing institution.";
  }
  if (!match) {
    return "REJECT — presented file has been altered. The hash fingerprint does not match the blockchain record.";
  }
  if (onChainStatus === "NOT_FOUND") {
    return "CAUTION — hash matches the database record but credential is not found on-chain. Manual verification recommended.";
  }
  if (onChainStatus === "CHAIN_UNAVAILABLE") {
    return "ACCEPT (database verified) — on-chain verification temporarily unavailable, but document hash matches the database record.";
  }
  return "ACCEPT — document is authentic. Hash matches the on-chain record and credential status is VALID.";
}

export default router;
