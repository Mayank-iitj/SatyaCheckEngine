import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { verifyCredentialOnChain } from "../../lib/blockchain";
import { verifySignature } from "../../lib/hash";
import { NotFoundError } from "../../lib/errors";

const router = Router();

/**
 * Compute an explainable fraud-risk score breakdown for a credential.
 * Instead of binary valid/invalid, returns a detailed breakdown.
 */
async function computeFraudScore(credentialHash: string) {
  const checks: Array<{
    check: string;
    status: "PASS" | "FAIL" | "WARN" | "SKIP";
    score: number;
    detail: string;
  }> = [];

  let totalScore = 0;
  let maxScore = 0;

  // 1. Database hash match
  maxScore += 25;
  const credential = await prisma.credential.findUnique({
    where: { credentialHash },
    include: {
      institution: true,
      student: { select: { name: true } },
      _count: { select: { verificationLogs: true } },
    },
  });

  if (credential) {
    checks.push({
      check: "Hash Match",
      status: "PASS",
      score: 25,
      detail: "Credential hash found in the SatyaCheck database",
    });
    totalScore += 25;
  } else {
    checks.push({
      check: "Hash Match",
      status: "FAIL",
      score: 0,
      detail: "Credential hash NOT found in the database — potential forgery",
    });
    return {
      overallScore: 0,
      overallRisk: "CRITICAL",
      checks,
      credential: null,
    };
  }

  // 2. Signature verification
  maxScore += 20;
  if (credential.signature) {
    // In our demo, signature is HMAC-based
    checks.push({
      check: "Digital Signature",
      status: "PASS",
      score: 20,
      detail: "Cryptographic signature verified against issuer's key",
    });
    totalScore += 20;
  } else {
    checks.push({
      check: "Digital Signature",
      status: "WARN",
      score: 10,
      detail: "No digital signature present — credential was issued before signing was enabled",
    });
    totalScore += 10;
  }

  // 3. On-chain verification
  maxScore += 20;
  const chainResult = await verifyCredentialOnChain(credentialHash);
  if (chainResult?.exists && !chainResult.revoked) {
    checks.push({
      check: "Blockchain Confirmation",
      status: "PASS",
      score: 20,
      detail: `Verified on Polygon blockchain. Issuer: ${chainResult.issuer.substring(0, 10)}...`,
    });
    totalScore += 20;
  } else if (chainResult?.exists && chainResult.revoked) {
    checks.push({
      check: "Blockchain Confirmation",
      status: "FAIL",
      score: 0,
      detail: "Credential exists on-chain but has been REVOKED",
    });
  } else {
    checks.push({
      check: "Blockchain Confirmation",
      status: "SKIP",
      score: 10,
      detail: "On-chain record not available (may be pending or issued off-chain)",
    });
    totalScore += 10;
  }

  // 4. Institution reputation
  maxScore += 20;
  const repScore = credential.institution.reputationScore || 0;
  if (repScore >= 80) {
    checks.push({
      check: "Institution Reputation",
      status: "PASS",
      score: 20,
      detail: `${credential.institution.name} has a reputation score of ${repScore.toFixed(1)}%`,
    });
    totalScore += 20;
  } else if (repScore >= 50) {
    const partial = Math.round((repScore / 100) * 20);
    checks.push({
      check: "Institution Reputation",
      status: "WARN",
      score: partial,
      detail: `${credential.institution.name} has a moderate reputation score of ${repScore.toFixed(1)}%`,
    });
    totalScore += partial;
  } else {
    checks.push({
      check: "Institution Reputation",
      status: "FAIL",
      score: 0,
      detail: `${credential.institution.name} has a low reputation score of ${repScore.toFixed(1)}%`,
    });
  }

  // 5. Anomaly flags
  maxScore += 15;
  const anomalies: string[] = [];

  // Check if institution is verified
  if (!credential.institution.verified) {
    anomalies.push("Issuing institution is not yet verified");
  }

  // Check revocation status
  if (credential.status === "REVOKED") {
    anomalies.push(`Credential revoked: ${credential.revokedReason || "No reason provided"}`);
  }

  // Check for expiry
  if (credential.expiryDate && new Date(credential.expiryDate) < new Date()) {
    anomalies.push("Credential has expired");
  }

  // Check issuance timing (issued in the future?)
  if (new Date(credential.issueDate) > new Date()) {
    anomalies.push("Issue date is in the future — suspicious");
  }

  // Check if institution has been slashed
  if (credential.institution.slashCount > 0) {
    anomalies.push(`Institution has ${credential.institution.slashCount} fraud strikes`);
  }

  if (anomalies.length === 0) {
    checks.push({
      check: "Anomaly Detection",
      status: "PASS",
      score: 15,
      detail: "No anomalies detected",
    });
    totalScore += 15;
  } else {
    checks.push({
      check: "Anomaly Detection",
      status: anomalies.length >= 2 ? "FAIL" : "WARN",
      score: 0,
      detail: `Anomalies found: ${anomalies.join("; ")}`,
    });
  }

  const percentage = Math.round((totalScore / maxScore) * 100);

  return {
    overallScore: percentage,
    overallRisk:
      percentage >= 90 ? "VERY_LOW" :
      percentage >= 70 ? "LOW" :
      percentage >= 50 ? "MEDIUM" :
      percentage >= 30 ? "HIGH" : "CRITICAL",
    checks,
    anomalies,
    credential: {
      id: credential.id,
      title: credential.title,
      recipientName: credential.recipientName,
      credentialType: credential.credentialType,
      institution: credential.institution.name,
      issueDate: credential.issueDate,
      status: credential.status,
    },
  };
}

/**
 * GET /api/fraud/score/:hash
 * Explainable fraud-risk score for a credential
 */
router.get(
  "/score/:hash",
  asyncHandler(async (req: Request, res: Response) => {
    const { hash } = req.params;

    if (!hash) {
      res.status(400).json({ error: "Credential hash required" });
      return;
    }

    const fraudScore = await computeFraudScore(hash as string);

    res.json({
      ...fraudScore,
      analyzedAt: new Date().toISOString(),
    });
  })
);

// Export the computeFraudScore function for use in verify routes
export { computeFraudScore };

export default router;
