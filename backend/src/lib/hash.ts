import crypto from "crypto";

/**
 * Generate SHA-256 hash of credential data
 * Returns a 0x-prefixed bytes32 hex string suitable for Solidity
 */
export function hashCredentialData(data: string | Buffer): string {
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return `0x${hash}`;
}

/**
 * Generate SHA-256 hash of a file buffer
 */
export function hashFile(buffer: Buffer): string {
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  return `0x${hash}`;
}

/**
 * Create a deterministic credential hash from structured data
 * Used when issuing credentials via form (not file upload)
 */
export function hashCredentialPayload(payload: {
  institutionId: string;
  studentId: string;
  credentialType: string;
  title: string;
  recipientName: string;
  issueDate: string;
}): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return hashCredentialData(canonical);
}

/**
 * Sign data with ECDSA (institution's digital signature)
 * In production, this would use an HSM/KMS. For demo, we use a local key.
 */
export function signData(data: string, privateKey: string): string {
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();

  try {
    return sign.sign(privateKey, "hex");
  } catch {
    // Fallback: create an HMAC-based signature for demo
    const hmac = crypto.createHmac("sha256", privateKey);
    hmac.update(data);
    return hmac.digest("hex");
  }
}

/**
 * Verify a signature
 */
export function verifySignature(
  data: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, "hex");
  } catch {
    // Fallback: HMAC verification
    const hmac = crypto.createHmac("sha256", publicKey);
    hmac.update(data);
    return hmac.digest("hex") === signature;
  }
}
