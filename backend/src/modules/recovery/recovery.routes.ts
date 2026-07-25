import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../lib/errors";

const router = Router();

/**
 * POST /api/recovery/request
 * Displaced person submits credential recovery request
 */
router.post(
  "/request",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { institutionId, originalTitle, originalType, originalDate, evidenceNotes, credentialId } = req.body;

    if (!institutionId || !originalTitle || !originalType) {
      throw new BadRequestError("institutionId, originalTitle, and originalType are required");
    }

    // Verify institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true, name: true },
    });

    if (!institution) {
      throw new NotFoundError("Institution not found");
    }

    const request = await prisma.recoveryRequest.create({
      data: {
        studentId: req.user!.id,
        institutionId,
        credentialId: credentialId || null,
        originalTitle,
        originalType,
        originalDate: originalDate || "Unknown",
        evidenceNotes: evidenceNotes || null,
        status: "PENDING",
      },
      include: {
        institution: { select: { name: true } },
      },
    });

    // Audit event
    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "RECOVERY_REQUESTED",
        entityType: "RecoveryRequest",
        entityId: request.id,
        metadata: { institutionId, originalTitle },
      },
    });

    res.status(201).json({
      request,
      message: `Recovery request submitted to ${institution.name}. They will review and re-attest your credential.`,
    });
  })
);

/**
 * GET /api/recovery/mine
 * Student views their recovery requests
 */
router.get(
  "/mine",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const requests = await prisma.recoveryRequest.findMany({
      where: { studentId: req.user!.id },
      include: {
        institution: { select: { name: true, country: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  })
);

/**
 * GET /api/recovery/pending
 * University sees pending re-attestation requests
 */
router.get(
  "/pending",
  authenticate,
  requireRole("UNIVERSITY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const where: any = { status: "PENDING" };

    if (req.user!.role === "UNIVERSITY") {
      const inst = await prisma.institution.findUnique({ where: { userId: req.user!.id } });
      if (!inst) throw new ForbiddenError("Institution not found");
      where.institutionId = inst.id;
    }

    const requests = await prisma.recoveryRequest.findMany({
      where,
      include: {
        student: { select: { name: true, email: true } },
        institution: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  })
);

/**
 * POST /api/recovery/:id/attest
 * University re-attests a previously issued credential
 */
router.post(
  "/:id/attest",
  authenticate,
  requireRole("UNIVERSITY"),
  asyncHandler(async (req: Request, res: Response) => {
    const { approved, reviewNotes } = req.body;
    const id = req.params.id as string;

    const request = await prisma.recoveryRequest.findUnique({
      where: { id },
      include: { institution: true, student: true },
    });

    if (!request) throw new NotFoundError("Recovery request not found");

    // Verify the university owns this request
    const inst = await prisma.institution.findUnique({ where: { userId: req.user!.id } });
    if (!inst || inst.id !== request.institutionId) {
      throw new ForbiddenError("Not authorized to process this recovery request");
    }

    if (request.status !== "PENDING") {
      throw new BadRequestError("Request has already been processed");
    }

    const status = approved ? "ATTESTED" : "REJECTED";

    const updated = await prisma.recoveryRequest.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes || null,
        attestedAt: approved ? new Date() : null,
      },
    });

    // If attested, create a recovered credential
    if (approved) {
      const crypto = await import("crypto");
      const credentialHash =
        "0x" +
        crypto
          .createHash("sha256")
          .update(
            JSON.stringify({
              recovery: true,
              institutionId: inst.id,
              studentId: request.studentId,
              originalTitle: request.originalTitle,
              timestamp: Date.now(),
            })
          )
          .digest("hex");

      const newCred = await prisma.credential.create({
        data: {
          credentialHash,
          studentId: request.studentId,
          institutionId: inst.id,
          credentialType: request.originalType,
          title: `[RECOVERED] ${request.originalTitle}`,
          description: `Re-attested credential. Original documents lost. Recovery approved by ${inst.name}.`,
          recipientName: request.student.name,
          issueDate: new Date(),
          status: "VALID",
          metadata: {
            recoveryRequestId: request.id,
            originalDate: request.originalDate,
            recoveredAt: new Date().toISOString(),
          },
        },
      });

      await prisma.recoveryRequest.update({
        where: { id },
        data: { newCredentialId: newCred.id },
      });

      // Update platform stats
      await prisma.platformStats.upsert({
        where: { id: "global" },
        update: { recoveryCompleted: { increment: 1 } },
        create: { id: "global", recoveryCompleted: 1 },
      });
    }

    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: approved ? "RECOVERY_ATTESTED" : "RECOVERY_REJECTED",
        entityType: "RecoveryRequest",
        entityId: id,
        metadata: { approved, reviewNotes },
      },
    });

    res.json({
      request: updated,
      message: approved
        ? "Recovery request approved. A new credential has been issued to the student."
        : "Recovery request rejected.",
    });
  })
);

export default router;
