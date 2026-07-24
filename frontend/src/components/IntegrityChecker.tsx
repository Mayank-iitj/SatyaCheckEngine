"use client";

import { useState, useRef, useCallback } from "react";

interface IntegrityCheckResult {
  match: boolean;
  credentialId?: string;
  originalHash: string;
  presentedHash: string;
  diffSummary: string;
  onChainStatus: "VALID" | "REVOKED" | "NOT_FOUND" | "CHAIN_UNAVAILABLE";
  recommendation: string;
  canonicalization?: {
    method: string;
    strippedFields: string[];
    originalSize: number;
    canonicalSize: number;
  };
  verifiedAt: string;
}

interface IntegrityCheckerProps {
  credentialId?: string;
  credentialHash?: string;
  compact?: boolean;
}

/**
 * IntegrityChecker — The "watch what happens if I change one grade" demo component.
 *
 * Shows original hash and presented-file hash side-by-side in monospace.
 * A single-character document edit produces a completely different fingerprint.
 * This visual contrast is the key demo beat.
 */
export function IntegrityChecker({ credentialId, credentialHash, compact = false }: IntegrityCheckerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<IntegrityCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const runCheck = async () => {
    if (!file && !credentialId && !credentialHash) {
      setError("Please upload a file or provide a credential ID to check");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (credentialId) formData.append("credentialId", credentialId);
      if (credentialHash) formData.append("hash", credentialHash);

      const res = await fetch("/api/integrity/check", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data: IntegrityCheckResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render hash with character-level diff highlighting
  const renderHashDiff = (hashA: string, hashB: string, isA: boolean) => {
    const a = hashA.toLowerCase();
    const b = hashB.toLowerCase();
    const target = isA ? a : b;
    const compare = isA ? b : a;
    const isSame = a === b;

    return (
      <span style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11, letterSpacing: "0.02em", wordBreak: "break-all" }}>
        {target.split("").map((char, i) => {
          const isDiff = !isSame && char !== compare[i];
          return (
            <span
              key={i}
              style={{
                color: isSame ? "#a3e635" : isDiff ? "#ef4444" : "#a3a3a3",
                background: isDiff ? "rgba(239,68,68,0.15)" : "transparent",
                borderRadius: isDiff ? 2 : 0,
              }}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  if (compact) {
    return (
      <div style={styles.compactWrapper}>
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div style={styles.compactRow}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={styles.compactUploadBtn}
          >
            {file ? `📄 ${file.name}` : "📁 Upload to verify"}
          </button>
          <button
            onClick={runCheck}
            disabled={loading}
            style={styles.compactCheckBtn}
          >
            {loading ? "Checking..." : "Check Integrity"}
          </button>
        </div>
        {result && (
          <div
            style={{
              ...styles.compactResult,
              border: `1px solid ${result.match ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              background: result.match ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)",
            }}
          >
            <span style={{ color: result.match ? "#22c55e" : "#ef4444", fontWeight: 700 }}>
              {result.match ? "✓ MATCH" : "✗ MISMATCH"}
            </span>
            <span style={{ fontSize: 12, color: "#888" }}>{result.diffSummary.slice(0, 80)}...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.headerIcon}>🔐</div>
        <div>
          <h3 style={styles.title}>Integrity Verification Engine</h3>
          <p style={styles.subtitle}>
            Upload a document to verify it against the on-chain record.
            Even a single character change produces a completely different fingerprint.
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        style={{
          ...styles.dropZone,
          ...(dragOver ? styles.dropZoneActive : {}),
          ...(file ? styles.dropZoneHasFile : {}),
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div style={styles.fileInfo}>
            <span style={{ fontSize: 24 }}>📄</span>
            <div>
              <div style={styles.fileName}>{file.name}</div>
              <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }} style={styles.clearBtn}>✕</button>
          </div>
        ) : (
          <div style={styles.dropPrompt}>
            <span style={{ fontSize: 32 }}>📂</span>
            <span style={styles.dropText}>Drop document here to verify</span>
            <span style={styles.dropSub}>or click to browse</span>
          </div>
        )}
      </div>

      <button onClick={runCheck} disabled={loading || (!file && !credentialId && !credentialHash)} style={styles.checkBtn}>
        {loading ? (
          <><div style={styles.spinner} /> Verifying...</>
        ) : (
          <><span>🔍</span> Check Integrity</>
        )}
      </button>

      {error && (
        <div style={styles.errorBox}>⚠️ {error}</div>
      )}

      {/* Result — the star of the demo */}
      {result && (
        <div style={styles.resultBox}>
          {/* Verdict */}
          <div
            style={{
              ...styles.verdict,
              background: result.match
                ? "rgba(34,197,94,0.08)"
                : "rgba(239,68,68,0.08)",
              border: `1px solid ${result.match ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            }}
          >
            <span style={{ fontSize: 28 }}>{result.match ? "✅" : "❌"}</span>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: result.match ? "#22c55e" : "#ef4444",
                }}
              >
                {result.match ? "HASH MATCH" : "HASH MISMATCH"}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{result.diffSummary}</div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                padding: "6px 14px",
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                background: result.onChainStatus === "VALID" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                color: result.onChainStatus === "VALID" ? "#22c55e" : "#ef4444",
                border: `1px solid ${result.onChainStatus === "VALID" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
              }}
            >
              Chain: {result.onChainStatus}
            </div>
          </div>

          {/* Side-by-side hash comparison — the key demo visual */}
          <div style={styles.hashCompare}>
            <div style={styles.hashPanel}>
              <div style={styles.hashPanelHeader}>
                <span style={styles.hashPanelDot} />
                <span style={styles.hashPanelLabel}>Original (On-Chain Record)</span>
              </div>
              <div style={styles.hashPanelCode}>
                {renderHashDiff(result.originalHash, result.presentedHash, true)}
              </div>
            </div>
            <div style={styles.vsIndicator}>
              {result.match ? "=" : "≠"}
            </div>
            <div style={styles.hashPanel}>
              <div style={styles.hashPanelHeader}>
                <span style={{ ...styles.hashPanelDot, background: result.match ? "#22c55e" : "#ef4444" }} />
                <span style={styles.hashPanelLabel}>Presented Document</span>
              </div>
              <div style={styles.hashPanelCode}>
                {renderHashDiff(result.originalHash, result.presentedHash, false)}
              </div>
            </div>
          </div>

          {!result.match && (
            <div style={styles.diffExplanation}>
              <span style={{ fontSize: 14 }}>💡</span>
              <span>
                Even a <strong style={{ color: "#ef4444" }}>single character change</strong> in the source document
                produces a <strong>completely different</strong> 256-bit SHA-256 fingerprint.
                The highlighted characters above show where the hashes diverge.
              </span>
            </div>
          )}

          {/* Canonicalization details */}
          {result.canonicalization && (
            <div style={styles.canonDetails}>
              <span style={styles.canonLabel}>Canonicalization Method:</span>
              <code style={styles.canonValue}>{result.canonicalization.method}</code>
              {result.canonicalization.strippedFields.length > 0 && (
                <>
                  <span style={styles.canonLabel}>Stripped volatile fields:</span>
                  <code style={styles.canonValue}>{result.canonicalization.strippedFields.join(", ")}</code>
                </>
              )}
              <span style={styles.canonLabel}>Original / Canonical size:</span>
              <code style={styles.canonValue}>
                {(result.canonicalization.originalSize / 1024).toFixed(1)} KB → {(result.canonicalization.canonicalSize / 1024).toFixed(1)} KB
              </code>
            </div>
          )}

          {/* Recommendation */}
          <div
            style={{
              ...styles.recommendationBox,
              borderColor: result.match ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
              color: result.match ? "#86efac" : "#fca5a5",
            }}
          >
            <strong>Recommendation:</strong> {result.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  header: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  headerIcon: { fontSize: 28, flexShrink: 0 },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f5f5f5",
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    margin: "4px 0 0",
    lineHeight: 1.5,
  },
  dropZone: {
    border: "2px dashed rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: "28px 24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    background: "rgba(0,0,0,0.2)",
    minHeight: 80,
  },
  dropZoneActive: {
    border: "2px dashed #60a5fa",
    background: "rgba(96,165,250,0.05)",
  },
  dropZoneHasFile: {
    border: "2px solid rgba(34,197,94,0.3)",
    background: "rgba(34,197,94,0.04)",
  },
  fileInfo: { display: "flex", alignItems: "center", gap: 14, width: "100%" },
  fileName: { fontSize: 14, fontWeight: 600, color: "#f5f5f5" },
  fileSize: { fontSize: 12, color: "#22c55e" },
  clearBtn: {
    marginLeft: "auto",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    fontSize: 12,
  },
  dropPrompt: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
  },
  dropText: { fontSize: 14, fontWeight: 600, color: "#d1d5db" },
  dropSub: { fontSize: 12, color: "#555" },
  checkBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "linear-gradient(135deg, #1e3a5f, #1e40af)",
    border: "1px solid rgba(96,165,250,0.3)",
    color: "#93c5fd",
    padding: "12px 28px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  spinner: {
    width: 14,
    height: 14,
    border: "2px solid rgba(147,197,253,0.3)",
    borderTop: "2px solid #93c5fd",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13,
    color: "#fca5a5",
  },
  resultBox: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 14,
  },
  verdict: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderRadius: 14,
    padding: "18px 22px",
  },
  hashCompare: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  hashPanel: {
    flex: 1,
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "14px 16px",
    overflow: "hidden",
  },
  hashPanelHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  hashPanelDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#22c55e",
    flexShrink: 0,
  },
  hashPanelLabel: {
    fontSize: 11,
    color: "#666",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
  },
  hashPanelCode: {
    lineHeight: 1.6,
  },
  vsIndicator: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: "#888",
    fontWeight: 700,
  },
  diffExplanation: {
    display: "flex",
    gap: 10,
    background: "rgba(239,68,68,0.05)",
    border: "1px solid rgba(239,68,68,0.12)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 13,
    color: "#d1d5db",
    lineHeight: 1.5,
  },
  canonDetails: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    fontSize: 11,
    background: "rgba(0,0,0,0.2)",
    borderRadius: 10,
    padding: "10px 14px",
    alignItems: "center",
  },
  canonLabel: { color: "#666", fontWeight: 600 },
  canonValue: {
    fontFamily: "monospace",
    color: "#a3e635",
    marginRight: 12,
  },
  recommendationBox: {
    borderRadius: 10,
    border: "1px solid",
    padding: "12px 16px",
    fontSize: 13,
    lineHeight: 1.5,
  },
  compactWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },
  compactRow: {
    display: "flex",
    gap: 8,
  },
  compactUploadBtn: {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#d1d5db",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 12,
    cursor: "pointer",
    textAlign: "left" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  compactCheckBtn: {
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.3)",
    color: "#60a5fa",
    padding: "10px 16px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  compactResult: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
  },
};
