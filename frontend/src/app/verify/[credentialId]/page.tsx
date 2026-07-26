"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

interface VerificationData {
  credentialId: string;
  credentialHash: string;
  onChainStatus: "VALID" | "REVOKED" | "NOT_FOUND" | "CHAIN_UNAVAILABLE";
  dbStatus: string;
  institution: { id: string; name: string; logoUrl?: string | null };
  recipientName: string;
  issueDate: string;
  credentialType: string;
  title: string;
  txHash?: string | null;
  source: string;
  sealedCopyCID?: string | null;
  forensicsReport?: any;
  verificationUrl: string;
}

export default function PublicVerifyPage() {
  const params = useParams();
  const credentialId = params.credentialId as string;

  const [data, setData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCredential = useCallback(async () => {
    try {
      const res = await fetch(`/api/integrity/${credentialId}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load credential");
    } finally {
      setLoading(false);
    }
  }, [credentialId]);

  useEffect(() => {
    fetchCredential();
  }, [fetchCredential]);

  const copyHash = () => {
    if (data?.credentialHash) {
      navigator.clipboard.writeText(data.credentialHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSealed = () => {
    window.open(`/api/credentials/${credentialId}/sealed-pdf`, "_blank");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "VALID":
        return {
          color: "#22c55e",
          bg: "rgba(34,197,94,0.1)",
          border: "rgba(34,197,94,0.3)",
          icon: "✓",
          label: "VALID",
          message: "This credential is authentic and currently active.",
        };
      case "REVOKED":
        return {
          color: "#ef4444",
          bg: "rgba(239,68,68,0.1)",
          border: "rgba(239,68,68,0.3)",
          icon: "✗",
          label: "REVOKED",
          message: "This credential has been revoked by the issuing institution.",
        };
      default:
        return {
          color: "#f59e0b",
          bg: "rgba(245,158,11,0.1)",
          border: "rgba(245,158,11,0.3)",
          icon: "⚠",
          label: status,
          message: "Verification status could not be fully confirmed.",
        };
    }
  };

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.gridOverlay} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <a href="/" style={styles.logo}>
            <span style={styles.logoIcon}>🔒</span>
            <span style={styles.logoText}>SatyaCheck</span>
          </a>
          <span style={styles.headerTag}>Credential Verification</span>
        </div>
      </header>

      <main style={styles.main}>
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Verifying credential on blockchain...</p>
          </div>
        )}

        {error && !loading && (
          <div style={styles.errorCard}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h2 style={styles.errorTitle}>Credential Not Found</h2>
            <p style={styles.errorText}>{error}</p>
            <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
              ID: <code style={styles.codeInline}>{credentialId}</code>
            </p>
          </div>
        )}

        {data && !loading && (
          <div style={styles.container}>
            {/* Status Banner */}
            {(() => {
              const status = getStatusConfig(data.onChainStatus);
              return (
                <div
                  style={{
                    ...styles.statusBanner,
                    background: status.bg,
                    border: `1px solid ${status.border}`,
                  }}
                >
                  <span
                    style={{
                      ...styles.statusIcon,
                      color: status.color,
                      background: `${status.color}20`,
                      border: `2px solid ${status.color}40`,
                    }}
                  >
                    {status.icon}
                  </span>
                  <div>
                    <div style={{ ...styles.statusLabel, color: status.color }}>
                      {status.label}
                    </div>
                    <div style={styles.statusMessage}>{status.message}</div>
                  </div>
                  {data.source === "DIGILOCKER_VERIFIED" && (
                    <div style={styles.digilockerBadge}>
                      <span>🇮🇳</span>
                      <span>DigiLocker Verified</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Institution Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.institutionLogo}>
                  {data.institution.logoUrl ? (
                    <img
                      src={data.institution.logoUrl}
                      alt={data.institution.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <span style={{ fontSize: 28 }}>🎓</span>
                  )}
                </div>
                <div>
                  <div style={styles.institutionName}>{data.institution.name}</div>
                  <div style={styles.credentialTypeTag}>{data.credentialType.replace(/_/g, " ")}</div>
                </div>
              </div>

              <div style={styles.divider} />

              <h1 style={styles.credentialTitle}>{data.title}</h1>

              <div style={styles.fieldsGrid}>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Recipient</span>
                  <span style={styles.fieldValue}>{data.recipientName}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Issue Date</span>
                  <span style={styles.fieldValue}>
                    {new Date(data.issueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Credential Type</span>
                  <span style={styles.fieldValue}>{data.credentialType}</span>
                </div>
                <div style={styles.field}>
                  <span style={styles.fieldLabel}>Verification Source</span>
                  <span
                    style={{
                      ...styles.fieldValue,
                      color: data.source === "DIGILOCKER_VERIFIED" ? "#60a5fa" : "#a3a3a3",
                    }}
                  >
                    {data.source === "DIGILOCKER_VERIFIED"
                      ? "🇮🇳 DigiLocker Verified"
                      : "SatyaCheck Issued"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof */}
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Cryptographic Proof</h2>

              <div style={styles.hashBlock}>
                <div style={styles.hashLabel}>Credential ID (Human-Shareable)</div>
                <code style={styles.hashValue}>{data.credentialId}</code>
              </div>

              <div style={{ ...styles.hashBlock, marginTop: 12 }}>
                <div style={styles.hashLabel}>
                  SHA-256 Fingerprint (Credential Hash)
                  <button onClick={copyHash} style={styles.copyBtn}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <code style={{ ...styles.hashValue, fontSize: 11, letterSpacing: "0.02em" }}>
                  {data.credentialHash}
                </code>
              </div>

              {data.txHash && (
                <div style={{ ...styles.hashBlock, marginTop: 12 }}>
                  <div style={styles.hashLabel}>On-Chain Transaction</div>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${data.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.txLink}
                  >
                    <code style={{ ...styles.hashValue, fontSize: 11, color: "#60a5fa" }}>
                      {data.txHash}
                    </code>
                    <span style={{ marginLeft: 8, color: "#60a5fa" }}>↗</span>
                  </a>
                </div>
              )}

              <div style={styles.onChainNote}>
                <span style={{ fontSize: 14 }}>⛓️</span>
                <span>
                  This credential is cryptographically anchored to the Polygon blockchain. The
                  SHA-256 hash above is the unique fingerprint — any modification to the original
                  document produces a completely different fingerprint.
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.actionsCard}>
              <button onClick={handleDownloadSealed} style={styles.downloadBtn}>
                <span style={{ fontSize: 16 }}>📥</span>
                Download Sealed Official PDF
              </button>
              <div style={styles.downloadNote}>
                The sealed PDF includes a digital signature block, verification QR code, and
                cryptographic watermark. Open in any PDF reader to see the built-in signature panel.
              </div>
            </div>

            {/* Verification URL */}
            <div style={styles.urlCard}>
              <span style={styles.urlLabel}>🔗 Permanent Verification URL</span>
              <code style={styles.urlValue}>{data.verificationUrl}</code>
            </div>

            <div style={styles.footer}>
              <span>Verified by SatyaCheck • Powered by Polygon Blockchain</span>
              <span style={{ color: "#444" }}>No login required to verify</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #0f1018 50%, #0a0c15 100%)",
    color: "#e5e7eb",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  gridOverlay: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "16px 0",
    position: "relative",
    zIndex: 10,
    background: "rgba(10,10,15,0.8)",
    backdropFilter: "blur(20px)",
  },
  headerInner: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoIcon: { fontSize: 22 },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  headerTag: {
    fontSize: 12,
    color: "#60a5fa",
    background: "rgba(96,165,250,0.1)",
    border: "1px solid rgba(96,165,250,0.2)",
    padding: "4px 12px",
    borderRadius: 20,
    fontWeight: 500,
  },
  main: {
    position: "relative",
    zIndex: 1,
    padding: "48px 24px 80px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
    gap: 20,
  },
  spinner: {
    width: 44,
    height: 44,
    border: "3px solid rgba(96,165,250,0.2)",
    borderTop: "3px solid #60a5fa",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#888",
    fontSize: 14,
  },
  errorCard: {
    maxWidth: 500,
    margin: "80px auto",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "48px 40px",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#f5f5f5",
    margin: "0 0 12px",
  },
  errorText: {
    color: "#888",
    fontSize: 14,
    lineHeight: 1.6,
  },
  container: {
    maxWidth: 860,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  statusBanner: {
    borderRadius: 16,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
    flexShrink: 0,
  },
  statusLabel: {
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: "0.05em",
  },
  statusMessage: {
    fontSize: 13,
    color: "#a0a0a0",
    marginTop: 2,
  },
  digilockerBadge: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(59,130,246,0.3)",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: "#93c5fd",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: "28px 32px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  institutionLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },
  institutionName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f5f5f5",
  },
  credentialTypeTag: {
    display: "inline-block",
    marginTop: 4,
    fontSize: 11,
    color: "#60a5fa",
    background: "rgba(96,165,250,0.1)",
    border: "1px solid rgba(96,165,250,0.2)",
    padding: "2px 10px",
    borderRadius: 10,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "0 0 20px",
  },
  credentialTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#ffffff",
    margin: "0 0 24px",
    lineHeight: 1.3,
  },
  fieldsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontWeight: 600,
  },
  fieldValue: {
    fontSize: 14,
    color: "#d1d5db",
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#f5f5f5",
    margin: "0 0 20px",
  },
  hashBlock: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "12px 16px",
  },
  hashLabel: {
    fontSize: 11,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontWeight: 600,
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  hashValue: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: 12,
    color: "#a3e635",
    wordBreak: "break-all" as const,
    letterSpacing: "0.03em",
  },
  copyBtn: {
    marginLeft: "auto",
    background: "rgba(96,165,250,0.1)",
    border: "1px solid rgba(96,165,250,0.2)",
    color: "#60a5fa",
    borderRadius: 6,
    padding: "2px 10px",
    fontSize: 11,
    cursor: "pointer",
    fontWeight: 600,
  },
  txLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  },
  onChainNote: {
    marginTop: 16,
    display: "flex",
    gap: 10,
    background: "rgba(96,165,250,0.05)",
    border: "1px solid rgba(96,165,250,0.1)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  actionsCard: {
    background: "linear-gradient(135deg, rgba(96,165,250,0.08), rgba(139,92,246,0.08))",
    border: "1px solid rgba(96,165,250,0.15)",
    borderRadius: 20,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 12,
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    border: "none",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "-0.01em",
  },
  downloadNote: {
    fontSize: 12,
    color: "#888",
    textAlign: "center" as const,
    maxWidth: 480,
    lineHeight: 1.6,
  },
  urlCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },
  urlLabel: {
    fontSize: 11,
    color: "#60a5fa",
    fontWeight: 600,
  },
  urlValue: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#d1d5db",
    wordBreak: "break-all" as const,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#555",
    padding: "0 4px",
  },
  codeInline: {
    fontFamily: "monospace",
    background: "rgba(255,255,255,0.06)",
    padding: "2px 6px",
    borderRadius: 4,
  },
};
