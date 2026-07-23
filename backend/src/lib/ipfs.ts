import crypto from "crypto";
import { config } from "../config";
import fs from "fs";
import path from "path";

/**
 * Upload a file to IPFS (Pinata) or local fallback
 */
export async function uploadToIPFS(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ cid: string; uri: string }> {
  if (config.ipfsProvider === "pinata" && config.pinataJwt) {
    return uploadToPinata(fileBuffer, fileName);
  }
  return uploadToLocal(fileBuffer, fileName);
}

import { withRetry } from "./retry";

/**
 * Upload to Pinata IPFS
 */
async function uploadToPinata(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ cid: string; uri: string }> {
  const blob = new Blob([fileBuffer]);
  const file = new File([blob], fileName);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("network", "public");

  const response = await withRetry(async () => {
    const res = await fetch("https://uploads.pinata.cloud/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.pinataJwt}`,
      },
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error(`Pinata upload failed: ${res.statusText}`);
    }
    return res;
  }, { retries: 3, initialDelay: 1000 });

  const data = await response.json();
  const cid = data.data?.cid || data.IpfsHash;
  const gateway = config.pinataGateway || "gateway.pinata.cloud";

  return {
    cid,
    uri: `ipfs://${cid}`,
  };
}

/**
 * Local file storage fallback (for development without Pinata)
 */
async function uploadToLocal(
  fileBuffer: Buffer,
  fileName: string
): Promise<{ cid: string; uri: string }> {
  // Generate a CID-like hash for local storage
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  const cid = `local_${hash}`;

  const uploadsDir = path.join(__dirname, "..", "..", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(fileName);
  const filePath = path.join(uploadsDir, `${cid}${ext}`);
  fs.writeFileSync(filePath, fileBuffer);

  return {
    cid,
    uri: `local://${cid}${ext}`,
  };
}

/**
 * Get the URL for accessing an IPFS file
 */
export function getIPFSUrl(cid: string): string {
  if (cid.startsWith("local_")) {
    return `/api/files/${cid}`;
  }
  const gateway = config.pinataGateway || "gateway.pinata.cloud";
  return `https://${gateway}/ipfs/${cid}`;
}
