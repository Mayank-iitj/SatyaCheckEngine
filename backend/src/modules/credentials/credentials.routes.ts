import { Router, Request, Response } from "express";
import multer from "multer";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../lib/prisma";
import { authenticate, requireRole, optionalAuth } from "../../middleware/auth";
import { hashCredentialPayload, hashFile, signData } from "../../lib/hash";
import { uploadToIPFS, getIPFSUrl } from "../../lib/ipfs";
import { issueCredentialOnChain, revokeCredentialOnChain } from "../../lib/blockchain";
import { generateQRDataURL, getVerificationUrl } from "../../lib/qr";
import { config } from "../../config";
import { validateRequest } from "../../middleware/validate";
import { issueCredentialSchema } from "./credentials.schemas";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/errors";
import { buildMerkleTree, getMerkleProof } from "../../lib/merkle";
import { canonicalizeDocument, computeCanonicalHash } from "../../lib/canonicalize";
import { runForensicsPipeline } from "../../lib/pdf-forensics";
import { generateSealedPDF } from "../../lib/sealed-pdf";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/credentials/issue
 * University issues a new credential
 */
router.post(
  "/issue",
  authenticate,
  requireRole("UNIVERSITY"),
  upload.single("file"),
  // Note: we can't fully validate `req.body` with zod before multer parses it if it's multipart, 
  // but multer runs first so we can run validateRequest here.
  validateRequest(issueCredentialSchema),
  asyncHandler(async (req: Request, res: Response) => {
    // Get institution
    const institution = await prisma.institution.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) {
      throw new ForbiddenError("Institution profile not found");
    }
    if (!institution.verified) {
      throw new ForbiddenError("Institution not yet verified");
    }

    const {
      studentEmail,
      credentialType,
      title,
      recipientName,
      issueDate,
      description,
      expiryDate,
    } = req.body;

    // Find or validate student
    let student = await prisma.user.findUnique({ where: { email: studentEmail } });

    if (!student) {
      // Auto-create student account (they can claim it later)
      const bcrypt = await import("bcrypt");
      const tempPassword = await bcrypt.default.hash("changeme123", config.bcryptRounds);
      student = await prisma.user.create({
        data: {
          email: studentEmail,
          passwordHash: tempPassword,
          name: recipientName,
          role: "STUDENT",
        },
      });
    }

    // Generate credential hash
    let credentialHash: string;
    let ipfsCID: string | null = null;
    let metadataURI: string | null = null;
    let forensicsReport: any = null;

    if (req.file) {
      // File-based credential: use canonical hash (strips volatile PDF metadata)
      const canonResult = computeCanonicalHash(
        req.file.buffer,
        {
          institutionId: institution.id,
          studentId: student.id,
          credentialType: credentialType || "DEGREE",
          issueDate: issueDate || new Date().toISOString(),
        },
        req.file.mimetype
      );
      credentialHash = canonResult.hash;

      // Upload original file to IPFS
      const ipfsResult = await uploadToIPFS(req.file.buffer, req.file.originalname);
      ipfsCID = ipfsResult.cid;
      metadataURI = ipfsResult.uri;

      // Run forensics pipeline (non-blocking for response speed)
      // Result is stored back to DB after credential is created
      runForensicsPipeline(req.file.buffer, institution.id)
        .then((report) => {
          forensicsReport = report;
        })
        .catch(() => {
          // Non-fatal
        });
    } else {
      // Form-based credential
      credentialHash = hashCredentialPayload({
        institutionId: institution.id,
        studentId: student.id,
        credentialType: credentialType || "DEGREE",
        title: title || "Academic Credential",
        recipientName: recipientName || student.name,
        issueDate: issueDate || new Date().toISOString(),
      });
    }

    // Check for duplicate
    const existing = await prisma.credential.findUnique({
      where: { credentialHash },
    });
    if (existing) {
      throw new BadRequestError("Credential with this hash already exists");
    }

    // Sign the credential
    const signature = signData(credentialHash, config.privateKey);

    // Issue on-chain
    let txHash: string | null = null;
    try {
      const chainResult = await issueCredentialOnChain(
        credentialHash,
        metadataURI || `satyacheck://${credentialHash}`
      );
      if (chainResult) {
        txHash = chainResult.txHash;
      }
    } catch (err) {
      console.warn("On-chain issuance failed (non-fatal):", err);
    }

    // Save to database
    // Generate a human-shareable UUID v4 credentialId (separate from DB primary key)
    // This is what gets printed on physical certificates and used in public verification URLs
    const credentialId = uuidv4();

    const credential = await prisma.credential.create({
      data: {
        credentialHash,
        credentialId,          // NEW: human-shareable UUID
        studentId: student.id,
        institutionId: institution.id,
        credentialType: credentialType || "DEGREE",
        title: title || "Academic Credential",
        description,
        recipientName: recipientName || student.name,
        issueDate: new Date(issueDate || Date.now()),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        ipfsCID,
        metadataURI,
        txHash,
        signature,
        status: "VALID",
        source: "MANUAL",     // NEW: source field
        integrityChecked: !!req.file, // NEW: mark as checked if file-based
      },
      include: {
        student: { select: { id: true, email: true, name: true } },
        institution: { select: { id: true, name: true } },
      },
    });

    // ── Async post-issuance jobs (non-blocking) ─────────────────────────
    // 1. Store forensics report (if we ran it above)
    // 2. Generate and pin sealed PDF
    setImmediate(async () => {
      try {
        // Wait for forensics to complete (it was kicked off above)
        await new Promise((r) => setTimeout(r, 2000));

        const updateData: any = {};
        if (forensicsReport) {
          updateData.forensicsReport = forensicsReport;
        }

        // Generate sealed PDF
        if (req.file || true) { // Always generate sealed PDF, even for form-based
          const sealResult = await generateSealedPDF(
            req.file?.buffer || Buffer.alloc(0),
            {
              credentialId: credential.credentialId || credential.id,
              credentialHash: credential.credentialHash,
              institutionName: credential.institution.name,
              recipientName: credential.recipientName,
              issueDate: credential.issueDate,
              txHash: credential.txHash,
            }
          );
          updateData.sealedCopyCID = sealResult.sealedCopyCID;
          updateData.sealedCopyHash = sealResult.sealedCopyHash;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.credential.update({
            where: { id: credential.id },
            data: updateData,
          });
        }
      } catch (err) {
        console.error("Post-issuance async job failed (non-fatal):", err);
      }
    });

    // Generate QR code — use credentialId as the primary identifier in URLs
    const qrCode = await generateQRDataURL(credentialHash, credential.credentialId || credential.id);
    const verificationUrl = `${config.appUrl}/verify/${credential.credentialId || credential.id}`;

    // Create audit event
    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "CREDENTIAL_ISSUED",
        entityType: "Credential",
        entityId: credential.id,
        metadata: {
          credentialHash,
          credentialId: credential.credentialId,
          txHash,
          studentEmail,
          credentialType,
        },
      },
    });

    res.status(201).json({
      credential: {
        ...credential,
        credentialId: credential.credentialId || credential.id,
      },
      qrCode,
      verificationUrl,
      txHash,
    });
  })
);

/**
 * GET /api/credentials/:id/sealed-pdf
 * Download the sealed, non-editable official copy of a credential.
 * Sealed PDFs have a visual watermark, QR code, credentialHash fingerprint,
 * and digital signature block. Students always receive this — never the raw original.
 */
router.get(
  "/:id/sealed-pdf",
  optionalAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    // Look up by credentialId (UUID) or DB id
    const credential = await prisma.credential.findFirst({
      where: {
        OR: [{ credentialId: id }, { id }],
      },
      include: {
        institution: { select: { name: true, logoUrl: true } },
        student: { select: { name: true } },
      },
    });

    if (!credential) {
      throw new NotFoundError("Credential not found");
    }

    // If sealed PDF is already generated and on IPFS, redirect there
    if ((credential as any).sealedCopyCID) {
      const cid = (credential as any).sealedCopyCID as string;
      if (!cid.startsWith("local_")) {
        const gateway = config.pinataGateway || "gateway.pinata.cloud";
        res.redirect(`https://${gateway}/ipfs/${cid}`);
    return;
      }
    }

    // Generate sealed PDF on-the-fly
    const sealResult = await generateSealedPDF(
      Buffer.alloc(0), // No source file available at download time — overlay-only
      {
        credentialId: (credential as any).credentialId || credential.id,
        credentialHash: credential.credentialHash,
        institutionName: credential.institution.name,
        recipientName: credential.recipientName,
        issueDate: credential.issueDate,
        txHash: credential.txHash,
      }
    );

    // Store sealed copy CID for future requests
    prisma.credential.update({
      where: { id: credential.id },
      data: {
        sealedCopyCID: sealResult.sealedCopyCID,
        sealedCopyHash: sealResult.sealedCopyHash,
      },
    }).catch(() => {});

    // Stream PDF to client
    const fileName = `SatyaCheck-Sealed-${(credential as any).credentialId || credential.id}.pdf`;
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": sealResult.sealedPdfBuffer.length,
      "X-Credential-Id": (credential as any).credentialId || credential.id,
      "X-Credential-Hash": credential.credentialHash,
      "X-Sealed-Copy-Hash": sealResult.sealedCopyHash,
    });

    res.send(sealResult.sealedPdfBuffer);
    return;
  })
);

/**
 * GET /api/credentials/mine
 * Student views their credentials
 */
router.get("/mine", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const credentials = await prisma.credential.findMany({
    where: { studentId: req.user!.id },
    include: {
      institution: { select: { id: true, name: true, logoUrl: true } },
      _count: { select: { verificationLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Add QR codes
  const credentialsWithQR = await Promise.all(
    credentials.map(async (cred) => {
      const qrCode = await generateQRDataURL(cred.credentialHash, cred.id);
      const verificationUrl = getVerificationUrl(cred.credentialHash, cred.id);
      return { ...cred, qrCode, verificationUrl };
    })
  );

  res.json(credentialsWithQR);
}));

/**
 * GET /api/credentials/issued
 * University views credentials they've issued
 */
router.get("/issued", authenticate, requireRole("UNIVERSITY"), asyncHandler(async (req: Request, res: Response) => {
  const institution = await prisma.institution.findUnique({
    where: { userId: req.user!.id },
  });

  if (!institution) {
    throw new ForbiddenError("Institution not found");
  }

  const credentials = await prisma.credential.findMany({
    where: { institutionId: institution.id },
    include: {
      student: { select: { id: true, email: true, name: true } },
      _count: { select: { verificationLogs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(credentials);
}));

/**
 * GET /api/credentials/admin/all
 * Admin views all credentials (paginated)
 */
router.get("/admin/all", authenticate, requireRole("ADMIN"), asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const [credentials, total] = await Promise.all([
    prisma.credential.findMany({
      include: {
        student: { select: { name: true, email: true } },
        institution: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.credential.count(),
  ]);

  res.json({ credentials, total, page, limit });
}));

/**
 * GET /api/credentials/:id
 * Get a single credential with full details
 */
router.get("/:id", authenticate, asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const credential = await prisma.credential.findUnique({
    where: { id },
    include: {
      student: { select: { id: true, email: true, name: true } },
      institution: { select: { id: true, name: true, logoUrl: true, country: true } },
      verificationLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!credential) {
    throw new NotFoundError("Credential not found");
  }

  // Security check: only issuer, recipient, or admin can view
  if (
    credential.studentId !== req.user!.id &&
    credential.institutionId !== req.user!.id &&
    req.user!.role !== "ADMIN"
  ) {
    const institution = await prisma.institution.findUnique({ where: { userId: req.user!.id } });
    if (!institution || institution.id !== credential.institutionId) {
      throw new ForbiddenError("Not authorized to view this credential");
    }
  }

  res.json(credential);
}));

/**
 * POST /api/credentials/:id/revoke
 * University revokes a credential
 */
router.post("/:id/revoke", authenticate, requireRole("UNIVERSITY"), asyncHandler(async (req: Request, res: Response) => {
  const { reason } = req.body;
  if (!reason) {
    throw new BadRequestError("Revocation reason is required");
  }

  const institution = await prisma.institution.findUnique({
    where: { userId: req.user!.id },
  });

  if (!institution) {
    throw new ForbiddenError("Institution not found");
  }

  const id = req.params.id as string;
  const credential = await prisma.credential.findUnique({
    where: { id },
  });

  if (!credential) {
    throw new NotFoundError("Credential not found");
  }

  if (credential.institutionId !== institution.id) {
    throw new ForbiddenError("Not authorized to revoke this credential");
  }

  if (credential.status === "REVOKED") {
    throw new BadRequestError("Credential is already revoked");
  }

  // Revoke on chain
  let revokeTxHash: string | null = null;
  try {
    const chainResult = await revokeCredentialOnChain(credential.credentialHash, reason);
    if (chainResult) {
      revokeTxHash = chainResult.txHash;
    }
  } catch (err) {
    console.warn("On-chain revocation failed (non-fatal):", err);
  }

  const updated = await prisma.credential.update({
    where: { id: credential.id },
    data: { status: "REVOKED" },
  });

  await prisma.auditEvent.create({
    data: {
      actorId: req.user!.id,
      action: "CREDENTIAL_REVOKED",
      entityType: "Credential",
      entityId: credential.id,
      metadata: { reason, txHash: revokeTxHash },
    },
  });

  res.json(updated);
}));

/**
 * POST /api/credentials/batch-issue
 * Merkle-tree batch issuance: issue entire graduating class as one Merkle root on-chain
 */
router.post(
  "/batch-issue",
  authenticate,
  requireRole("UNIVERSITY"),
  asyncHandler(async (req: Request, res: Response) => {
    const institution = await prisma.institution.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution || !institution.verified) {
      throw new ForbiddenError("Institution not found or not verified");
    }

    const { credentials: credentialList } = req.body;

    if (!Array.isArray(credentialList) || credentialList.length === 0) {
      throw new BadRequestError("Provide an array of credentials to batch-issue");
    }

    if (credentialList.length > 500) {
      throw new BadRequestError("Maximum 500 credentials per batch");
    }

    // 1. Generate hashes for all credentials
    const hashes: string[] = [];
    const bcrypt = await import("bcrypt");
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const createdCredentials = [];

    for (const cred of credentialList) {
      const { studentEmail, credentialType, title, recipientName, issueDate, description, expiryDate } = cred;

      // Find or create student
      let student = await prisma.user.findUnique({ where: { email: studentEmail } });
      if (!student) {
        const tempPassword = await bcrypt.default.hash("changeme123", config.bcryptRounds);
        student = await prisma.user.create({
          data: { email: studentEmail, passwordHash: tempPassword, name: recipientName, role: "STUDENT" },
        });
      }

      const credentialHash = hashCredentialPayload({
        institutionId: institution.id,
        studentId: student.id,
        credentialType: credentialType || "DEGREE",
        title: title || "Academic Credential",
        recipientName: recipientName || student.name,
        issueDate: issueDate || new Date().toISOString(),
      });

      hashes.push(credentialHash);

      createdCredentials.push({
        credentialHash,
        studentId: student.id,
        institutionId: institution.id,
        credentialType: credentialType || "DEGREE",
        title: title || "Academic Credential",
        description,
        recipientName: recipientName || student.name,
        issueDate: new Date(issueDate || Date.now()),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: "VALID",
        batchId,
        signature: signData(credentialHash, config.privateKey),
      });
    }

    // 2. Build Merkle tree
    const tree = buildMerkleTree(hashes);

    // 3. Issue Merkle root on-chain (1 transaction for all credentials!)
    let txHash: string | null = null;
    try {
      const chainResult = await issueCredentialOnChain(tree.root, `satyacheck://batch/${batchId}`);
      if (chainResult) txHash = chainResult.txHash;
    } catch (err) {
      console.warn("On-chain batch issuance failed (non-fatal):", err);
    }

    // 4. Save all credentials with Merkle proofs
    const saved = [];
    for (let i = 0; i < createdCredentials.length; i++) {
      const proof = getMerkleProof(tree, hashes[i]);

      // Skip duplicates
      const existing = await prisma.credential.findUnique({
        where: { credentialHash: createdCredentials[i].credentialHash },
      });
      if (existing) continue;

      const cred = await prisma.credential.create({
        data: {
          ...createdCredentials[i],
          merkleRoot: tree.root,
          merkleProof: proof,
          txHash,
        },
      });
      saved.push(cred);
    }

    // 5. Audit
    await prisma.auditEvent.create({
      data: {
        actorId: req.user!.id,
        action: "BATCH_CREDENTIALS_ISSUED",
        entityType: "Credential",
        entityId: batchId,
        metadata: {
          batchId,
          count: saved.length,
          merkleRoot: tree.root,
          txHash,
        },
      },
    });

    res.status(201).json({
      batchId,
      merkleRoot: tree.root,
      txHash,
      credentialsIssued: saved.length,
      gasSaved: `~${(saved.length - 1) * 50000} gas saved by batching (${saved.length} credentials in 1 transaction)`,
    });
  })
);

export default router;
