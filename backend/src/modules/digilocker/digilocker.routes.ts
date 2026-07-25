/**
 * DigiLocker Gateway Adapter
 *
 * ⚠️  SANDBOX / MOCK IMPLEMENTATION
 *
 * This module simulates DigiLocker's Pull API and Issuer API to demonstrate
 * the full integration flow. All responses mirror the real DigiLocker API
 * contract shape (https://www.digilocker.gov.in/technical-specification).
 *
 * Production deployment requires:
 *  - DigiLocker partner/issuer onboarding (https://partners.digilocker.gov.in)
 *  - Registered OAuth2 client credentials
 *  - Institution registration as a DigiLocker-approved issuer
 *
 * Endpoints:
 *   POST /api/digilocker/consent  — initiate OAuth2 consent flow (mocked)
 *   POST /api/digilocker/fetch    — pull issued document (mocked)
 *   POST /api/digilocker/push     — push credential to student's DigiLocker (mocked)
 */

import { Router, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole } from "../../middleware/auth";
import { BadRequestError, NotFoundError } from "../../lib/errors";

const router = Router();

// ── Mock DigiLocker document store ─────────────────────────────────────────
// In production: these are fetched from DigiLocker's actual API
const MOCK_DIGILOCKER_DOCUMENTS: Record<string, MockDocument[]> = {
  // Keyed by mock digiLockerId (e.g., student's DigiLocker account ID)
  DL_ALICE_001: [
    {
      docType: "DEGREE",
      issuer: "MIT Demo University",
      issuedDocument: true, // government/institution-issued — NOT self-uploaded
      issuedDate: "2023-06-15",
      recipientName: "Alice Johnson",
      title: "Bachelor of Science in Computer Science",
      credentialType: "DEGREE",
      documentId: "DL_DOC_MIT_2023_001",
      uri: "https://api.digitallocker.gov.in/public/oauth2/1/file/MIT_CS_2023_ALICE", // mock
      verificationStatus: "VERIFIED",
      metadata: {
        gpa: "3.9",
        honors: "Summa Cum Laude",
        department: "Computer Science and Artificial Intelligence",
      },
    },
    {
      docType: "TRANSCRIPT",
      issuer: "MIT Demo University",
      issuedDocument: true,
      issuedDate: "2023-06-15",
      recipientName: "Alice Johnson",
      title: "Official Academic Transcript",
      credentialType: "TRANSCRIPT",
      documentId: "DL_DOC_MIT_2023_002",
      uri: "https://api.digitallocker.gov.in/public/oauth2/1/file/MIT_TRANS_2023_ALICE",
      verificationStatus: "VERIFIED",
      metadata: {},
    },
    {
      docType: "SELF_UPLOAD",
      issuer: null,
      issuedDocument: false, // self-uploaded — NOT eligible for skip-forensics
      issuedDate: "2022-01-01",
      recipientName: "Alice Johnson",
      title: "Personal Resume",
      credentialType: "OTHER",
      documentId: "DL_DOC_SELF_001",
      uri: null,
      verificationStatus: "NOT_VERIFIED",
      metadata: {},
    },
  ],
  DL_BOB_001: [
    {
      docType: "DIPLOMA",
      issuer: "IIT Demo Institute",
      issuedDocument: true,
      issuedDate: "2024-05-20",
      recipientName: "Bob Singh",
      title: "Diploma in Data Engineering",
      credentialType: "DIPLOMA",
      documentId: "DL_DOC_IIT_2024_001",
      uri: "https://api.digitallocker.gov.in/public/oauth2/1/file/IIT_DIPL_2024_BOB",
      verificationStatus: "VERIFIED",
      metadata: { specialization: "Machine Learning Systems" },
    },
  ],
};

interface MockDocument {
  docType: string;
  issuer: string | null;
  issuedDocument: boolean;
  issuedDate: string;
  recipientName: string;
  title: string;
  credentialType: string;
  documentId: string;
  uri: string | null;
  verificationStatus: string;
  metadata: Record<string, string>;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

/**
 * POST /api/digilocker/consent
 *
 * Step 1: Initiate DigiLocker OAuth2 consent flow.
 * In production: redirects student to DigiLocker's OAuth2 authorization URL.
 * In mock: returns a consent token + a simulated consent screen URL.
 *
 * Body: { studentId, docType?, redirectUri? }
 * Returns: { consentToken, consentUrl, expiresIn }
 */
router.post(
  "/consent",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId, docType, redirectUri } = req.body;

    if (!studentId) {
      throw new BadRequestError("studentId is required");
    }

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundError("Student not found");
    }

    const consentToken = `DL_CONSENT_${uuidv4().replace(/-/g, "").toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store consent session in DB
    await prisma.digiLockerConsent.create({
      data: {
        studentId,
        consentToken,
        status: "PENDING",
        docType: docType || null,
        expiresAt,
      },
    });

    // Simulated consent URL (in production: real DigiLocker OAuth2 endpoint)
    const mockConsentUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/digilocker/consent?token=${consentToken}&student=${encodeURIComponent(student.name)}${docType ? `&docType=${docType}` : ""}`;

    res.json({
      // ⚠️ SANDBOX MOCK — DigiLocker API contract shape
      consentToken,
      consentUrl: mockConsentUrl,
      expiresIn: 600, // seconds
      studentName: student.name,
      studentId,
      docType: docType || "ALL",
      message:
        "[SANDBOX] In production, redirect student to the real DigiLocker OAuth2 authorization URL. " +
        "The student logs in with their DigiLocker credentials and approves ProofMind's access request.",
      mockNote:
        "For demo: call POST /api/digilocker/consent/approve with this consentToken to simulate the student approving access.",
    });
  })
);

/**
 * POST /api/digilocker/consent/approve
 * SANDBOX ONLY: Simulate a student approving the DigiLocker consent
 *
 * Body: { consentToken, digiLockerId }
 */
router.post(
  "/consent/approve",
  asyncHandler(async (req: Request, res: Response) => {
    const { consentToken, digiLockerId } = req.body;

    if (!consentToken) {
      throw new BadRequestError("consentToken is required");
    }

    const consent = await prisma.digiLockerConsent.findUnique({
      where: { consentToken },
    });

    if (!consent) {
      throw new NotFoundError("Consent session not found");
    }

    if (consent.status === "EXPIRED" || new Date() > consent.expiresAt) {
      await prisma.digiLockerConsent.update({
        where: { consentToken },
        data: { status: "EXPIRED" },
      });
      throw new BadRequestError("Consent session has expired");
    }

    // Approve the consent
    await prisma.digiLockerConsent.update({
      where: { consentToken },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        digiLockerId: digiLockerId || "DL_ALICE_001", // default to demo account
      },
    });

    res.json({
      success: true,
      consentToken,
      message: "[SANDBOX] Consent approved. You can now call POST /api/digilocker/fetch with this token.",
    });
  })
);

/**
 * POST /api/digilocker/fetch
 *
 * Step 2: Pull issued document(s) from DigiLocker using approved consent token.
 * Only returns documents where issuedDocument === true.
 *
 * Body: { consentToken, docType? }
 * Returns: { documents: [...], totalFetched, issuedCount, selfUploadedCount }
 */
router.post(
  "/fetch",
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { consentToken, docType } = req.body;

    if (!consentToken) {
      throw new BadRequestError("consentToken is required");
    }

    const consent = await prisma.digiLockerConsent.findUnique({
      where: { consentToken },
    });

    if (!consent) {
      throw new NotFoundError("Consent session not found");
    }

    if (consent.status !== "APPROVED") {
      throw new BadRequestError(
        `Consent status is "${consent.status}". Consent must be APPROVED before fetching documents.`
      );
    }

    if (new Date() > consent.expiresAt) {
      await prisma.digiLockerConsent.update({
        where: { consentToken },
        data: { status: "EXPIRED" },
      });
      throw new BadRequestError("Consent session has expired");
    }

    // Simulate DigiLocker Pull API response
    const digiLockerId = consent.digiLockerId || "DL_ALICE_001";
    let documents = MOCK_DIGILOCKER_DOCUMENTS[digiLockerId] || [];

    // Filter by docType if specified
    if (docType) {
      documents = documents.filter((d) => d.docType === docType);
    }

    // Separate government-issued from self-uploaded
    const issuedDocuments = documents.filter((d) => d.issuedDocument);
    const selfUploaded = documents.filter((d) => !d.issuedDocument);

    // Mark consent as used
    await prisma.digiLockerConsent.update({
      where: { consentToken },
      data: { status: "USED" },
    });

    res.json({
      // ⚠️ SANDBOX MOCK — mirrors DigiLocker Pull API response structure
      consentToken,
      digiLockerId,
      totalFetched: documents.length,
      issuedCount: issuedDocuments.length,
      selfUploadedCount: selfUploaded.length,
      documents: documents.map((doc) => ({
        ...doc,
        // Critical flag: DigiLocker distinguishes institution-issued vs self-uploaded
        // Only issuedDocument: true records are eligible for direct anchoring
        eligibleForDirectAnchoring: doc.issuedDocument,
        skipForensicsReason: doc.issuedDocument
          ? "Document is government/institution-attested via DigiLocker — forensics pipeline skipped"
          : null,
      })),
      message:
        "[SANDBOX] In production, these documents are fetched from the real DigiLocker API using the student's OAuth2 access token. " +
        "Only documents with issuedDocument: true are eligible for direct hashing and anchoring (skipping forensics).",
    });
  })
);

/**
 * POST /api/digilocker/push
 *
 * Step 3 (Issuer API): After a credential is anchored on-chain by a registered university,
 * push a copy directly into the student's DigiLocker account.
 *
 * In production: calls DigiLocker's Issuer API (requires DigiLocker issuer registration).
 * In mock: simulates the push and returns a success response.
 *
 * Body: {
 *   credentialId: string,
 *   studentDigilockerId: string,
 *   universityId: string
 * }
 */
router.post(
  "/push",
  authenticate,
  requireRole("UNIVERSITY", "ADMIN"),
  asyncHandler(async (req: Request, res: Response) => {
    const { credentialId, studentDigilockerId, universityId } = req.body;

    if (!credentialId || !studentDigilockerId) {
      throw new BadRequestError("credentialId and studentDigilockerId are required");
    }

    // Look up the credential
    const credential = await prisma.credential.findFirst({
      where: {
        OR: [{ credentialId }, { id: credentialId }],
      },
      include: {
        institution: { select: { name: true } },
        student: { select: { name: true, email: true } },
      },
    });

    if (!credential) {
      throw new NotFoundError("Credential not found");
    }

    // Simulate the DigiLocker Issuer API push
    const pushReferenceId = `DL_PUSH_${uuidv4().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    // Log the push attempt
    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "DIGILOCKER_PUSH",
        entityType: "Credential",
        entityId: credential.id,
        metadata: {
          credentialId: credential.credentialId || credential.id,
          studentDigilockerId,
          pushReferenceId,
          institutionName: credential.institution.name,
          recipientName: credential.student.name,
        },
      },
    });

    res.json({
      // ⚠️ SANDBOX MOCK — mirrors DigiLocker Issuer API response
      success: true,
      pushReferenceId,
      credentialId: credential.credentialId || credential.id,
      studentDigilockerId,
      message:
        "[SANDBOX] In production, this calls DigiLocker's Issuer API to push the issued credential " +
        "directly into the student's DigiLocker account. The student sees it in their DigiLocker dashboard " +
        "under 'Issued Documents' alongside their Aadhar card and other government documents.",
      simulatedPayload: {
        // This is what would be sent to DigiLocker's actual Issuer API
        issuerId: universityId || credential.institution.name,
        recipientDigilockerId: studentDigilockerId,
        documentType: credential.credentialType,
        documentTitle: credential.title,
        issueDate: credential.issueDate,
        credentialHash: credential.credentialHash,
        blockchainTxHash: credential.txHash,
        verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify/${credential.credentialId || credential.id}`,
        issuedDocument: true, // This marks it as institution-issued, not self-uploaded
      },
    });
  })
);

export default router;
