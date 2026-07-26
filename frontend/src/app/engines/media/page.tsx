"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, ArrowLeft, Scan, Link2 } from "lucide-react";
import { satya } from "@/lib/satya";

function VerdictBadge({ verdict }: { verdict: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    AUTHENTIC:         { bg: "bg-emerald-950 border-emerald-600", text: "text-emerald-400" },
    MANIPULATED:       { bg: "bg-red-950 border-red-600",     text: "text-red-400" },
    SUSPICIOUS:        { bg: "bg-orange-950 border-orange-600", text: "text-orange-400" },
    SYNTHETIC:         { bg: "bg-purple-950 border-purple-600", text: "text-purple-400" },
    INSUFFICIENT_DATA: { bg: "bg-ink-800 border-ink-600",     text: "text-ink-300" },
  };
  const cfg = config[verdict] || config.INSUFFICIENT_DATA;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold uppercase tracking-widest text-sm ${cfg.bg} ${cfg.text}`}>
      {verdict.replace(/_/g, " ")}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 70 ? "#22c55e" : value >= 40 ? "#f97316" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between text-xs font-mono text-ink-400 mb-1">
        <span>Confidence</span><span>{value}%</span>
      </div>
      <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function MediaVerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const analyze = async () => {
    if (mode === "upload" && !file) return;
    if (mode === "url" && !url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await satya.mediaVerify(
        mode === "upload" ? file! : undefined,
        mode === "url" ? url : undefined
      );
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 font-sans">
      <header className="border-b border-ink-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-ink-900/90 backdrop-blur">
        <Link href="/verify" className="flex items-center gap-2 text-ink-400 hover:text-parchment-100 transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Verifier Hub
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">Engine Online</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest bg-purple-400/10 px-3 py-1 rounded-full mb-4">
            <Image className="w-3 h-3" /> Engine 2 — Deepfake Media Scanner
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">
            Media Authenticity<br /><span className="text-purple-400">Scanner</span>
          </h1>
          <p className="text-ink-400 mt-4 max-w-xl leading-relaxed">
            Upload images, PDFs, or provide a URL. We analyze EXIF metadata, editing traces, and C2PA provenance to detect deepfakes and doctored financial media.
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          {(["upload", "url"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setError(null); }}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${mode === m ? "bg-purple-600 text-white" : "bg-ink-800 text-ink-400 hover:text-parchment-100 border border-ink-700"}`}>
              {m === "upload" ? <><Upload className="w-3 h-3 inline mr-1.5" />Upload File</> : <><Link2 className="w-3 h-3 inline mr-1.5" />Paste URL</>}
            </button>
          ))}
        </div>

        {/* Input */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          {mode === "upload" ? (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              className="border-2 border-dashed border-ink-700 hover:border-purple-500 rounded-2xl p-10 text-center cursor-pointer transition-colors group"
            >
              <input ref={fileRef} type="file" className="hidden" accept="image/*,application/pdf,video/*"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {preview ? (
                <div className="flex flex-col items-center gap-3">
                  <img src={preview} alt="preview" className="max-h-48 rounded-xl object-contain border border-ink-700" />
                  <p className="text-sm text-ink-400">{file?.name} ({((file?.size || 0) / 1024).toFixed(1)} KB)</p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-ink-600 group-hover:text-purple-400 mx-auto mb-3 transition-colors" />
                  <p className="text-ink-300 font-medium">Drop image, PDF, or video here</p>
                  <p className="text-xs text-ink-500 mt-1">Max 20 MB · JPG, PNG, PDF, MP4, WebM</p>
                  {file && <p className="mt-3 text-sm text-purple-400 font-medium">✓ {file.name} selected</p>}
                </>
              )}
            </div>
          ) : (
            <input type="url" value={url} onChange={e => setUrl(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-2xl p-5 text-parchment-100 font-mono text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder:text-ink-500"
              placeholder="https://example.com/suspicious-image.jpg" />
          )}

          <button onClick={analyze}
            disabled={loading || (mode === "upload" ? !file : !url.trim())}
            className="mt-4 w-full py-4 bg-purple-700 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning Metadata...</>
            ) : (
              <><Scan className="w-4 h-4" /> Scan for Deepfake / Manipulation</>
            )}
          </button>
        </motion.div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950 border border-red-700 text-red-300 text-sm font-medium mb-6">⚠️ {error}</div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Primary Result */}
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <VerdictBadge verdict={result.verdict} />
                    <p className="text-parchment-400 mt-3 leading-relaxed max-w-lg">{result.explanation}</p>
                    {result.scamCategory && <p className="mt-2 text-xs text-orange-400 font-bold uppercase tracking-wider">Scam Category: {result.scamCategory}</p>}
                    <div className="mt-4 max-w-xs"><ConfidenceBar value={result.confidence ?? 0} /></div>
                  </div>
                  {/* C2PA Badge */}
                  <div className={`flex flex-col items-center p-5 rounded-2xl border-2 min-w-[140px] ${result.c2paPresent ? "border-emerald-600 bg-emerald-950" : "border-ink-600 bg-ink-800/50"}`}>
                    {result.c2paPresent ? <ShieldCheck className="w-10 h-10 text-emerald-400 mb-2" /> : <ShieldAlert className="w-10 h-10 text-ink-500 mb-2" />}
                    <span className={`text-xs font-bold uppercase tracking-widest ${result.c2paPresent ? "text-emerald-400" : "text-ink-500"}`}>C2PA</span>
                    <span className={`text-xs mt-1 ${result.c2paPresent ? "text-emerald-300" : "text-ink-500"}`}>{result.c2paPresent ? "Verified" : "Not Present"}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Manipulation Indicators */}
                  {result.manipulationIndicators?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Manipulation Signals
                      </h3>
                      <div className="space-y-2">
                        {result.manipulationIndicators.map((s: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-red-300 bg-red-950/40 border border-red-900/50 px-3 py-2 rounded-lg">
                            <span className="text-red-500 flex-shrink-0">✗</span>{s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Flags */}
                  {result.metadataFlags?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Metadata Flags</h3>
                      <div className="space-y-2">
                        {result.metadataFlags.map((f: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-orange-300 bg-orange-950/40 border border-orange-900/50 px-3 py-2 rounded-lg">
                            <span className="flex-shrink-0">⚑</span>{f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Authenticity Signals */}
                {result.authenticitySignals?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Authenticity Signals
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.authenticitySignals.map((s: string, i: number) => (
                        <span key={i} className="text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-900 px-3 py-1.5 rounded-full">✓ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 p-4 bg-bronze/10 border border-bronze/30 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-bronze mb-2">Recommendation</h3>
                  <p className="text-sm text-parchment-300">{result.recommendation}</p>
                </div>
                <p className="mt-4 text-xs text-ink-500 font-mono">Engine: {result.engine} • {new Date(result.analyzedAt).toLocaleTimeString()}</p>
              </div>

              {/* Raw Metadata Panel */}
              {result.metadata && Object.keys(result.metadata).length > 0 && (
                <details className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
                  <summary className="text-xs font-bold uppercase tracking-widest text-ink-400 cursor-pointer hover:text-parchment-100 transition-colors">
                    Raw Metadata Extracted ▾
                  </summary>
                  <pre className="mt-4 text-xs font-mono text-ink-300 overflow-auto max-h-64 leading-relaxed">
                    {JSON.stringify(result.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
