import { Router } from "express";
import multer from "multer";
import crypto from "crypto";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Mock SEBI Registered Entity Registry
const REGISTERED_ENTITIES = [
  "INZ000031633", // Zerodha
  "INZ000218931", // Upstox
  "INZ000292834", // Groww
  "SEBI_HQ",
  "NSE_INDIA",
  "BSE_INDIA"
];

/**
 * Layer 1: Authenticity Backbone (C2PA Verification)
 * Simulates checking a cryptographic signature (C2PA standard) on media/documents
 * and verifying it against the SEBI registered-entity registry.
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ error: "No file provided for C2PA verification." });
    }

    // Simulate C2PA extraction and verification
    // In a real implementation, we would parse the C2PA manifest from the file bytes
    
    const fileSize = file.size;
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    // For demonstration, we'll simulate a valid C2PA signature if the filename contains "signed"
    const originalName = file.originalname.toLowerCase();
    
    let isSigned = false;
    let signerId = null;
    let isTampered = false;

    if (originalName.includes("signed")) {
      isSigned = true;
      signerId = "INZ000031633"; // Simulate Zerodha signing
    }
    
    if (originalName.includes("tampered")) {
      isSigned = true;
      signerId = "INZ000031633";
      isTampered = true; // Signature broken
    }

    if (!isSigned) {
      return res.json({
        status: "UNVERIFIED",
        message: "No cryptographic signature found.",
        c2paData: null,
        registryMatch: false,
        tamperDetected: false,
        layer1Verdict: "Unsigned content. Proceed to Layer 2 AI Detection."
      });
    }

    if (isTampered) {
      return res.json({
        status: "TAMPERED",
        message: "Cryptographic signature broken. File has been altered.",
        c2paData: {
          signerId,
          timestamp: new Date().toISOString(),
          hash: fileHash
        },
        registryMatch: REGISTERED_ENTITIES.includes(signerId!),
        tamperDetected: true,
        layer1Verdict: "TAMPER DETECTED. Reject immediately."
      });
    }

    // Valid signature, check registry
    const isRegistered = REGISTERED_ENTITIES.includes(signerId!);

    return res.json({
      status: isRegistered ? "VERIFIED" : "UNAUTHORIZED_SIGNER",
      message: isRegistered ? "Cryptographically verified." : "Signed, but entity is not in SEBI registry.",
      c2paData: {
        signerId,
        entityName: isRegistered ? "Zerodha Broking Ltd." : "Unknown Entity",
        timestamp: new Date().toISOString(),
        hash: fileHash
      },
      registryMatch: isRegistered,
      tamperDetected: false,
      layer1Verdict: isRegistered ? "AUTHENTIC. No further AI detection needed." : "UNAUTHORIZED. Treat as suspicious."
    });

  } catch (error: any) {
    console.error("C2PA Verification Error:", error);
    res.status(500).json({ error: "Failed to process C2PA verification." });
  }
});

export default router;
