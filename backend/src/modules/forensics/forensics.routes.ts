/**
 * Document Forensics Module
 * POST /api/forensics/analyze
 *
 * Runs the full tamper-detection pipeline on a manually uploaded document:
 *  1. Font consistency check
 *  2. Metadata/producer check
 *  3. Layout/template diff
 *  4. Pixel forensics (ELA)
 *
 * Returns an explainable report used by the University Portal
 * to decide whether to proceed with issuance.
 *
 * This pipeline runs ONLY on manually uploaded documents (not DigiLocker-fetched ones).
 */
import { Router, Request, Response } from "express";
import multer from "multer";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { runForensicsPipeline } from "../../lib/pdf-forensics";
import { BadRequestError } from "../../lib/errors";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

/**
 * POST /api/forensics/analyze
 *
 * Authenticated: UNIVERSITY or ADMIN only
 * (Students shouldn't be able to probe forensics checks before submitting)
 *
 * Body (multipart/form-data):
 *   file: PDF or document to analyze (required)
 *   institutionId?: string — for institution-specific font whitelist & template
 *   credentialType?: string — for template selection
 */
router.post(
  "/analyze",
  authenticate,
  requireRole("UNIVERSITY", "ADMIN"),
  upload.single("file"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("A document file is required for forensics analysis");
    }

    const { institutionId, credentialType } = req.body;

    // Resolve institution from authenticated user if not provided
    let resolvedInstitutionId = institutionId;
    if (!resolvedInstitutionId && req.user?.role === "UNIVERSITY") {
      const institution = await prisma.institution.findUnique({
        where: { userId: req.user.id },
      });
      resolvedInstitutionId = institution?.id;
    }

    // Run the forensics pipeline
    const report = await runForensicsPipeline(req.file.buffer, resolvedInstitutionId);

    // Log the analysis (non-blocking)
    prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "FORENSICS_ANALYZED",
        entityType: "Document",
        entityId: resolvedInstitutionId || "unknown",
        metadata: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          overallRisk: report.overallRisk,
          recommendation: report.recommendation,
        },
      },
    }).catch(() => {});

    res.json(report);
  })
);

/**
 * GET /api/forensics/report/:credentialId
 * Retrieve stored forensics report for an already-issued credential
 * (Stored in credential.forensicsReport JSON column)
 */
router.get(
  "/report/:credentialId",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { credentialId } = req.params;

    const credential = await prisma.credential.findFirst({
      where: {
        OR: [{ credentialId: credentialId as string }, { id: credentialId as string }],
      },
      select: {
        id: true,
        credentialId: true,
        forensicsReport: true,
        integrityChecked: true,
        source: true,
        title: true,
        institution: { select: { id: true, name: true } },
      },
    });

    if (!credential) {
      res.status(404).json({ error: "Credential not found" });
    return;
    }

    // Only institution that issued it or admin can view forensics report
    const isAdmin = req.user?.role === "ADMIN";
    let isIssuer = false;

    if (!isAdmin && req.user?.role === "UNIVERSITY") {
      const institution = await prisma.institution.findUnique({
        where: { userId: req.user.id },
      });
      isIssuer = institution?.id === credential.institution.id;
    }

    if (!isAdmin && !isIssuer) {
      res.status(403).json({ error: "Not authorized to view forensics report" });
    return;
    }

    res.json({
      credentialId: credential.credentialId || credential.id,
      title: credential.title,
      source: credential.source,
      integrityChecked: credential.integrityChecked,
      forensicsReport: credential.forensicsReport || null,
      institution: credential.institution,
    });
  })
);

export default router;
