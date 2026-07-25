"use client";

import { useState, useCallback, useRef } from "react";
import { forensicsAPI } from "@/lib/api";

type CheckStatus = "pass" | "warning" | "fail" | "skipped" | null;

interface CheckResult {
  status: CheckStatus;
  detail?: string;
  fontsFound?: string[];
  flaggedFonts?: string[];
  producer?: string;
  creator?: string;
  creationDate?: string;
  modDate?: string;
  daysBetweenCreateAndMod?: number;
  similarity?: number;
  suspiciousRegions?: any[];
}

interface ForensicsReport {
  fontCheck: CheckResult;
  metadataCheck: CheckResult;
  layoutMatch: CheckResult;
  pixelForensics: CheckResult;
  overallRisk: "LOW" | "MEDIUM" | "HIGH";
  recommendation: string;
  analyzedAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: string; glow: string }> = {
  pass: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.25)",
    label: "PASS",
    icon: "✓",
    glow: "0 0 20px rgba(34,197,94,0.15)",
  },
  warning: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    label: "WARNING",
    icon: "⚠",
    glow: "0 0 20px rgba(245,158,11,0.15)",
  },
  fail: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    label: "FAIL",
    icon: "✗",
    glow: "0 0 20px rgba(239,68,68,0.15)",
  },
  skipped: {
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
    label: "SKIPPED",
    icon: "—",
    glow: "none",
  },
};

const RISK_CONFIG = {
  LOW: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", emoji: "🟢" },
  MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", emoji: "🟡" },
  HIGH: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", emoji: "🔴" },
};

export default function ForensicsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ForensicsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [animating, setAnimating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setReport(null);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  const runAnalysis = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setAnimating(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await forensicsAPI.analyze(formData);

      setTimeout(() => {
        setReport(data);
        setAnimating(false);
      }, 400);
    } catch (err: any) {
      setError(err.message);
      setAnimating(false);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCfg = (status: CheckStatus) =>
    STATUS_CONFIG[status || "skipped"] || STATUS_CONFIG.skipped;

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <a href="/university" style={styles.backLink}>← University Portal</a>
            <h1 style={styles.pageTitle}>Document Forensics</h1>
            <p style={styles.pageSubtitle}>
              AI-powered tamper detection pipeline — runs before credential issuance
            </p>
          </div>
          <div style={styles.headerBadge}>
            <span style={styles.badgeDot} />
            Pipeline Active
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.container}>
          {/* Upload Zone */}
          <div
            style={{
              ...styles.uploadZone,
              ...(dragOver ? styles.uploadZoneActive : {}),
              ...(file ? styles.uploadZoneHasFile : {}),
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {file ? (
              <div style={styles.fileSelected}>
                <div style={styles.fileIcon}>📄</div>
                <div>
                  <div style={styles.fileName}>{file.name}</div>
                  <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB • Ready for analysis</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setReport(null); }}
                  style={styles.clearBtn}
                >✕</button>
              </div>
            ) : (
              <div style={styles.uploadPrompt}>
                <div style={styles.uploadIcon}>🔍</div>
                <div style={styles.uploadText}>Drop a credential document here</div>
                <div style={styles.uploadSub}>PDF, JPG, PNG, DOCX supported • Max 20MB</div>
              </div>
            )}
          </div>

          {file && !report && (
            <button
              onClick={runAnalysis}
              disabled={loading}
              style={{ ...styles.analyzeBtn, ...(loading ? styles.analyzeBtnLoading : {}) }}
            >
              {loading ? (
                <>
                  <div style={styles.btnSpinner} />
                  Running Forensics Pipeline...
                </>
              ) : (
                <>
                  <span>🧬</span>
                  Run Forensics Analysis
                </>
              )}
            </button>
          )}

          {error && (
            <div style={styles.errorBox}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Forensics Pipeline Visualization (always visible, fills in on result) */}
          <div style={styles.pipelineGrid}>
            {[
              {
                key: "fontCheck",
                icon: "🔤",
                title: "Font Consistency",
                description: "Checks embedded font metadata against institution whitelist. Mixed fonts in a uniform field are a classic sign of selective editing.",
                result: report?.fontCheck ?? null,
              },
              {
                key: "metadataCheck",
                icon: "📋",
                title: "Metadata / Producer",
                description: "Reads PDF XMP/Info metadata. Flags ModDate significantly after CreationDate, or producer strings indicating general-purpose image editors.",
                result: report?.metadataCheck ?? null,
              },
              {
                key: "layoutMatch",
                icon: "📐",
                title: "Layout Template Diff",
                description: "Compares structural layout (page dimensions, content regions) against expected academic certificate templates.",
                result: report?.layoutMatch ?? null,
              },
              {
                key: "pixelForensics",
                icon: "🔬",
                title: "Pixel Forensics (ELA)",
                description: "Error Level Analysis surfaces localized compression artifacts typical of copy-paste or clone-stamp edits in scanned documents.",
                result: report?.pixelForensics ?? null,
              },
            ].map((check, idx) => {
              const cfg = getStatusCfg(check.result?.status ?? null);
              const hasResult = check.result !== null;

              return (
                <div
                  key={check.key}
                  style={{
                    ...styles.checkCard,
                    ...(hasResult ? { border: `1px solid ${cfg.border}`, boxShadow: cfg.glow } : {}),
                    animationDelay: `${idx * 120}ms`,
                  }}
                >
                  <div style={styles.checkCardTop}>
                    <div style={styles.checkMeta}>
                      <span style={styles.checkCardIcon}>{check.icon}</span>
                      <div>
                        <div style={styles.checkCardTitle}>{check.title}</div>
                        <div style={styles.checkCardDesc}>{check.description}</div>
                      </div>
                    </div>

                    {hasResult ? (
                      <div
                        style={{
                          ...styles.statusBadge,
                          color: cfg.color,
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                        }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{cfg.icon}</span>
                        <span>{cfg.label}</span>
                      </div>
                    ) : (
                      <div style={styles.pendingBadge}>
                        {loading ? <div style={styles.miniSpinner} /> : "—"}
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: hasResult ? "100%" : "0%",
                        background: hasResult
                          ? `linear-gradient(90deg, ${cfg.color}60, ${cfg.color})`
                          : "transparent",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>

                  {/* Detail */}
                  {check.result?.detail && (
                    <div style={{ ...styles.checkDetail, color: cfg.color + "cc" }}>
                      {check.result.detail}
                    </div>
                  )}

                  {/* Font details */}
                  {check.result?.fontsFound && check.result.fontsFound.length > 0 && (
                    <div style={styles.fontList}>
                      <span style={styles.fontListLabel}>Fonts detected:</span>
                      {check.result.fontsFound.map((f) => (
                        <span
                          key={f}
                          style={{
                            ...styles.fontTag,
                            ...(check.result?.flaggedFonts?.includes(f)
                              ? styles.fontTagFlagged
                              : styles.fontTagOk),
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadata details */}
                  {check.result?.producer && (
                    <div style={styles.metaDetails}>
                      <span style={styles.metaKey}>Producer:</span>
                      <span style={styles.metaVal}>{check.result.producer}</span>
                      {check.result.daysBetweenCreateAndMod !== undefined && (
                        <>
                          <span style={styles.metaKey}>Days since creation:</span>
                          <span
                            style={{
                              ...styles.metaVal,
                              color: (check.result.daysBetweenCreateAndMod ?? 0) > 1 ? "#f59e0b" : "#22c55e",
                            }}
                          >
                            {check.result.daysBetweenCreateAndMod}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Layout similarity */}
                  {check.result?.similarity !== undefined && (
                    <div style={styles.similarityBar}>
                      <span style={styles.metaKey}>Layout match:</span>
                      <div style={styles.simTrack}>
                        <div
                          style={{
                            ...styles.simFill,
                            width: `${(check.result.similarity ?? 0) * 100}%`,
                            background:
                              (check.result.similarity ?? 0) >= 0.85
                                ? "#22c55e"
                                : (check.result.similarity ?? 0) >= 0.7
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        />
                      </div>
                      <span style={{ ...styles.metaVal, color: cfg.color }}>
                        {((check.result.similarity ?? 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Risk Report */}
          {report && (
            <div
              style={{
                ...styles.overallCard,
                background: RISK_CONFIG[report.overallRisk].bg,
                border: `1px solid ${RISK_CONFIG[report.overallRisk].border}`,
              }}
            >
              <div style={styles.overallTop}>
                <div>
                  <div style={styles.overallLabel}>Overall Risk Assessment</div>
                  <div
                    style={{
                      ...styles.overallRisk,
                      color: RISK_CONFIG[report.overallRisk].color,
                    }}
                  >
                    {RISK_CONFIG[report.overallRisk].emoji} {report.overallRisk} RISK
                  </div>
                </div>
                <div style={styles.overallActions}>
                  {report.overallRisk === "LOW" && (
                    <button style={styles.proceedBtn}>
                      ✓ Proceed with Issuance
                    </button>
                  )}
                  {report.overallRisk === "MEDIUM" && (
                    <button style={styles.reviewBtn}>
                      ⚠ Manual Review Required
                    </button>
                  )}
                  {report.overallRisk === "HIGH" && (
                    <button style={styles.rejectBtn}>
                      ✗ Reject Document
                    </button>
                  )}
                </div>
              </div>

              <div style={styles.recommendation}>
                <span style={{ fontSize: 16 }}>💡</span>
                <span>
                  <strong>Recommendation: </strong>
                  {report.recommendation}
                </span>
              </div>

              <div style={styles.analyzedAt}>
                Analysis completed at {new Date(report.analyzedAt).toLocaleString()} •{" "}
                <a href="/university" style={{ color: "#60a5fa" }}>
                  Return to issuance flow
                </a>
              </div>
            </div>
          )}

          {/* JSON Export */}
          {report && (
            <details style={styles.jsonExport}>
              <summary style={styles.jsonSummary}>View raw forensics JSON report</summary>
              <pre style={styles.jsonBlock}>{JSON.stringify(report, null, 2)}</pre>
            </details>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #0d0f1a 50%, #0a0c15 100%)",
    color: "#e5e7eb",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    position: "relative",
  },
  gridOverlay: {
    position: "fixed",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "24px 0",
    background: "rgba(10,10,15,0.9)",
    backdropFilter: "blur(20px)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { display: "flex", flexDirection: "column" as const, gap: 4 },
  backLink: {
    fontSize: 12,
    color: "#60a5fa",
    textDecoration: "none",
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#666",
    margin: 0,
  },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.2)",
    padding: "8px 16px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: "#22c55e",
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
  },
  main: {
    position: "relative",
    zIndex: 1,
    padding: "40px 32px 80px",
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: 24,
  },
  uploadZone: {
    border: "2px dashed rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: "40px 32px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    background: "rgba(255,255,255,0.02)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadZoneActive: {
    border: "2px dashed rgba(96,165,250,0.6)",
    background: "rgba(96,165,250,0.05)",
  },
  uploadZoneHasFile: {
    border: "2px solid rgba(34,197,94,0.3)",
    background: "rgba(34,197,94,0.04)",
  },
  uploadPrompt: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 10,
  },
  uploadIcon: { fontSize: 40 },
  uploadText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#d1d5db",
  },
  uploadSub: { fontSize: 12, color: "#666" },
  fileSelected: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  fileIcon: { fontSize: 36 },
  fileName: { fontSize: 15, fontWeight: 600, color: "#f5f5f5" },
  fileSize: { fontSize: 12, color: "#22c55e", marginTop: 2 },
  clearBtn: {
    marginLeft: "auto",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#ef4444",
    borderRadius: 8,
    padding: "6px 12px",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
  },
  analyzeBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
    border: "none",
    color: "#fff",
    padding: "16px 40px",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "-0.01em",
    boxShadow: "0 4px 20px rgba(59,130,246,0.25)",
  },
  analyzeBtnLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  btnSpinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    display: "flex",
    gap: 10,
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 12,
    padding: "14px 18px",
    fontSize: 13,
    color: "#fca5a5",
  },
  pipelineGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  checkCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: "22px 24px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
    transition: "all 0.4s ease",
  },
  checkCardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  checkMeta: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    flex: 1,
  },
  checkCardIcon: { fontSize: 24, flexShrink: 0 },
  checkCardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#f5f5f5",
  },
  checkCardDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 1.5,
    marginTop: 3,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.04em",
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
  },
  pendingBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 28,
    borderRadius: 10,
    background: "rgba(255,255,255,0.05)",
    color: "#555",
    fontSize: 13,
    flexShrink: 0,
  },
  miniSpinner: {
    width: 12,
    height: 12,
    border: "2px solid rgba(255,255,255,0.1)",
    borderTop: "2px solid #60a5fa",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  progressTrack: {
    height: 3,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  checkDetail: {
    fontSize: 12,
    lineHeight: 1.5,
    padding: "8px 12px",
    background: "rgba(0,0,0,0.2)",
    borderRadius: 8,
  },
  fontList: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 6,
    alignItems: "center",
  },
  fontListLabel: { fontSize: 11, color: "#666", marginRight: 4 },
  fontTag: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 6,
    fontFamily: "monospace",
  },
  fontTagOk: {
    background: "rgba(34,197,94,0.1)",
    color: "#86efac",
    border: "1px solid rgba(34,197,94,0.2)",
  },
  fontTagFlagged: {
    background: "rgba(239,68,68,0.1)",
    color: "#fca5a5",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  metaDetails: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap" as const,
    alignItems: "center",
    fontSize: 12,
  },
  metaKey: { color: "#666", fontSize: 11 },
  metaVal: { color: "#d1d5db", fontFamily: "monospace", fontSize: 11 },
  similarityBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12,
  },
  simTrack: {
    flex: 1,
    height: 6,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 4,
    overflow: "hidden",
  },
  simFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.8s ease",
  },
  overallCard: {
    borderRadius: 20,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  overallTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  overallLabel: {
    fontSize: 12,
    color: "#888",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    fontWeight: 600,
    marginBottom: 6,
  },
  overallRisk: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  overallActions: { display: "flex", gap: 12 },
  proceedBtn: {
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    border: "none",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  reviewBtn: {
    background: "rgba(245,158,11,0.15)",
    border: "1px solid rgba(245,158,11,0.4)",
    color: "#fbbf24",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  rejectBtn: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.4)",
    color: "#f87171",
    padding: "12px 24px",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  recommendation: {
    display: "flex",
    gap: 10,
    fontSize: 14,
    color: "#d1d5db",
    background: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    padding: "12px 16px",
    lineHeight: 1.5,
  },
  analyzedAt: {
    fontSize: 11,
    color: "#555",
  },
  jsonExport: {
    background: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: "0 16px",
  },
  jsonSummary: {
    padding: "14px 0",
    cursor: "pointer",
    fontSize: 12,
    color: "#666",
    fontWeight: 600,
    letterSpacing: "0.04em",
  },
  jsonBlock: {
    fontSize: 11,
    color: "#a3e635",
    lineHeight: 1.6,
    overflowX: "auto" as const,
    paddingBottom: 16,
    fontFamily: "'JetBrains Mono', monospace",
  },
};
