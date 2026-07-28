import { Router } from "express";
import multer from "multer";
import crypto from "crypto";
import { Reader } from "@contentauth/c2pa-node";

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
 * Cryptographically verifies signatures on media/documents using official C2PA standard
 * and checking them against the SEBI registered-entity registry.
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ error: "No file provided for C2PA verification." });
    }

    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    let reader;
    try {
      reader = await Reader.fromAsset({ buffer: file.buffer, mimeType: file.mimetype });
    } catch (err: any) {
      console.warn("C2PA parsing error or no manifest:", err.message);
    }

    if (!reader || !reader.activeLabel) {
      return res.json({
        status: "UNVERIFIED",
        message: "No cryptographic signature found.",
        c2paData: null,
        registryMatch: false,
        tamperDetected: false,
        layer1Verdict: "Unsigned content. Proceed to Layer 2 AI Detection."
      });
    }

    const manifest = await reader.getActive();
    
    if (!manifest) {
      return res.json({
        status: "TAMPERED",
        message: "Cryptographic signature broken or missing active manifest.",
        c2paData: { timestamp: new Date().toISOString(), hash: fileHash },
        registryMatch: false,
        tamperDetected: true,
        layer1Verdict: "TAMPER DETECTED. Reject immediately."
      });
    }

    // Try to extract signer info. In C2PA, the signature details have the issuer/subject
    const signature = manifest.signatureInfo();
    const assertions = manifest.assertions();
    
    // As a demonstration for the prototype, we extract the organization name from the certificate
    // or fallback to checking the assertions (like authorship).
    let signerId = "UNKNOWN";
    if (signature && signature.issuer) {
      // In a real PKI, we'd extract the SEBI registration number from the cert extension
      // Here we simulate matching cert issuer string to our registry if it includes the ID
      const issuerStr = signature.issuer.toUpperCase();
      const found = REGISTERED_ENTITIES.find(id => issuerStr.includes(id));
      if (found) signerId = found;
      else signerId = signature.issuer; 
    } else {
      // Look for a creativework assertion author (if present)
      const authorAssertion = assertions.find((a: any) => a.label === 'stds.schema-org.CreativeWork');
      if (authorAssertion && authorAssertion.data && authorAssertion.data.author && authorAssertion.data.author[0]) {
        const authorName = authorAssertion.data.author[0].name || "";
        const found = REGISTERED_ENTITIES.find(id => authorName.includes(id));
        if (found) signerId = found;
        else signerId = authorName;
      }
    }

    const isRegistered = REGISTERED_ENTITIES.includes(signerId);

    return res.json({
      status: isRegistered ? "VERIFIED" : "UNAUTHORIZED_SIGNER",
      message: isRegistered ? "Cryptographically verified." : "Signed, but entity is not in SEBI registry.",
      c2paData: {
        signerId,
        entityName: isRegistered ? signerId : "Unknown Entity",
        timestamp: new Date().toISOString(),
        hash: fileHash,
        issuer: signature?.issuer || "Unknown",
        certInfo: signature?.subject || "Unknown"
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
