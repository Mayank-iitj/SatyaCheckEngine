import crypto from "crypto";

/**
 * Canonicalization routine for credential documents.
 *
 * The SAME normalization must be applied at both issuance time and verification time.
 * Stripping volatile metadata ensures the hash is stable across:
 *  - file re-saves (different access timestamps)
 *  - whitespace normalization
 *  - encoding differences (BOM, CRLF vs LF)
 *
 * For PDFs: we extract the raw binary and strip volatile xref/trailer offsets.
 * For non-PDF files: we strip BOM and normalize line endings only.
 */

export interface CanonicalizationResult {
  canonicalBuffer: Buffer;
  originalSize: number;
  canonicalSize: number;
  method: "PDF_STRIP_VOLATILE" | "TEXT_NORMALIZE" | "BINARY_PASSTHROUGH";
  strippedFields: string[];
}

/**
 * Canonicalize a document buffer for stable SHA-256 hashing.
 * This is the single source of truth for normalization — used at issuance AND verification.
 */
export function canonicalizeDocument(buffer: Buffer, mimeType?: string): CanonicalizationResult {
  const originalSize = buffer.length;

  // Detect PDF by magic bytes (%PDF-)
  const isPDF = buffer.length >= 5 && buffer.slice(0, 5).toString("ascii") === "%PDF-";

  if (isPDF || mimeType === "application/pdf") {
    return canonicalizePDF(buffer, originalSize);
  }

  // Text-based files: strip BOM, normalize line endings
  const isText =
    mimeType?.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml";

  if (isText) {
    return canonicalizeText(buffer, originalSize);
  }

  // Binary passthrough: hash the raw bytes as-is
  return {
    canonicalBuffer: buffer,
    originalSize,
    canonicalSize: buffer.length,
    method: "BINARY_PASSTHROUGH",
    strippedFields: [],
  };
}

/**
 * PDF canonicalization:
 * Strips volatile sections that change on every save but don't represent document content:
 *  - /ModDate entries (modification timestamps)
 *  - /ID array (random PDF instance identifiers regenerated each save)
 *  - PDF trailer xref byte offsets (startxref value)
 *  - %%EOF marker padding
 *
 * NOTE: We do NOT attempt to re-parse/re-render the PDF. We do a targeted
 * byte-level replacement of known volatile patterns. This is intentionally
 * conservative: if a pattern is ambiguous, we leave it intact.
 */
function canonicalizePDF(buffer: Buffer, originalSize: number): CanonicalizationResult {
  let str = buffer.toString("binary");
  const strippedFields: string[] = [];

  // Strip /ModDate entries: /ModDate (D:YYYYMMDDHHMMSS...)
  const origLen = str.length;
  str = str.replace(/\/ModDate\s*\([^)]*\)/g, "/ModDate (D:00000000000000)");
  if (str.length !== origLen || str.includes("/ModDate (D:00000000000000)")) {
    strippedFields.push("ModDate");
  }

  // Strip /CreationDate entries (keep the key, zero-out the value for consistency)
  // We preserve this field but normalize its value to isolate it from OS clock drift.
  // IMPORTANT: CreationDate is part of the metadata check in forensics — NOT stripped from hash input.
  // We only strip the volatile /ID array.

  // Strip /ID array: /ID [<hex><hex>] (regenerated each save by most PDF writers)
  str = str.replace(/\/ID\s*\[\s*<[0-9a-fA-F]*>\s*<[0-9a-fA-F]*>\s*\]/g, "/ID [<0> <0>]");
  strippedFields.push("PDF_ID_array");

  // Normalize startxref value (byte offset changes whenever content shifts)
  str = str.replace(/startxref\s+\d+/g, "startxref 0");
  strippedFields.push("startxref_offset");

  const canonicalBuffer = Buffer.from(str, "binary");
  return {
    canonicalBuffer,
    originalSize,
    canonicalSize: canonicalBuffer.length,
    method: "PDF_STRIP_VOLATILE",
    strippedFields,
  };
}

/**
 * Text canonicalization:
 * - Remove BOM (UTF-8, UTF-16 LE/BE)
 * - Normalize CRLF → LF
 * - Trim trailing whitespace from each line
 * - Ensure single trailing newline
 */
function canonicalizeText(buffer: Buffer, originalSize: number): CanonicalizationResult {
  const strippedFields: string[] = [];
  let text = buffer.toString("utf8");

  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
    strippedFields.push("BOM");
  }

  // Normalize line endings
  const beforeCRLF = text.length;
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (text.length !== beforeCRLF) strippedFields.push("CRLF_normalized");

  // Trim trailing spaces from each line
  text = text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  // Ensure single trailing newline
  text = text.trimEnd() + "\n";

  const canonicalBuffer = Buffer.from(text, "utf8");
  return {
    canonicalBuffer,
    originalSize,
    canonicalSize: canonicalBuffer.length,
    method: "TEXT_NORMALIZE",
    strippedFields,
  };
}

/**
 * Compute SHA-256 of canonicalized document + metadata payload.
 * This is the definitive hash stored on-chain and in the database.
 *
 * Metadata payload binds the hash to a specific credential issuance context,
 * preventing a document from being "transferred" to another student by re-hashing.
 */
export function computeCanonicalHash(
  documentBuffer: Buffer,
  metadataPayload: {
    institutionId: string;
    studentId: string;
    credentialType: string;
    issueDate: string;
  },
  mimeType?: string
): { hash: string; canonicalization: CanonicalizationResult } {
  const canonicalization = canonicalizeDocument(documentBuffer, mimeType);

  // Deterministic metadata string (sorted keys to prevent ordering attacks)
  const metaStr = JSON.stringify(metadataPayload, Object.keys(metadataPayload).sort());
  const metaBuffer = Buffer.from(metaStr, "utf8");

  // Final hash: SHA-256(canonicalDocument || metadataPayload)
  const hash = crypto
    .createHash("sha256")
    .update(canonicalization.canonicalBuffer)
    .update(metaBuffer)
    .digest("hex");

  return {
    hash: `0x${hash}`,
    canonicalization,
  };
}
