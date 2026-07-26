"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, Scan, ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { satya } from "@/lib/satya";

const RISK_EXAMPLES = [
  "Congratulations! You've been selected for SEBI's exclusive IPO allotment. Pay ₹5000 registration fee to this UPI ID to claim your shares: scammer@upi",
  "URGENT: Your trading account has been flagged by NSE Compliance. Call 9876543210 immediately to avoid suspension. This is your last notice.",
  "Sir, I am calling from SEBI headquarters. Your Aadhaar is linked to money laundering. You must transfer ₹50,000 to RBI's escrow account to clear your name.",
];

function RiskMeter({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 75) return "#ef4444";
    if (score >= 50) return "#f97316";
    if (score >= 25) return "#eab308";
    return "#22c55e";
  };
  const getLabel = () => {
    if (score >= 75) return "HIGH RISK";
    if (score >= 50) return "MEDIUM RISK";
    if (score >= 25) return "LOW RISK";
    return "SAFE";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#1f1f1f" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke={getColor()}
            strokeWidth="12"
            strokeDasharray={`${(score / 100) * 314} 314`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-parchment-100">{score}</span>
          <span className="text-xs text-ink-400 uppercase tracking-widest">/ 100</span>
        </div>
      </div>
      <span className="font-bold uppercase tracking-widest text-sm" style={{ color: getColor() }}>{getLabel()}</span>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const config: Record<string, { bg: string; text: string; icon: any }> = {
    SCAM:        { bg: "bg-red-950 border-red-600", text: "text-red-400", icon: ShieldAlert },
    SUSPICIOUS:  { bg: "bg-orange-950 border-orange-600", text: "text-orange-400", icon: AlertTriangle },
    LEGITIMATE:  { bg: "bg-emerald-950 border-emerald-600", text: "text-emerald-400", icon: ShieldCheck },
    UNKNOWN:     { bg: "bg-ink-800 border-ink-600", text: "text-ink-300", icon: Scan },
  };
  const cfg = config[verdict] || config.UNKNOWN;
  const Icon = cfg.icon;
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold uppercase tracking-widest text-sm ${cfg.bg} ${cfg.text}`}>
      <Icon className="w-4 h-4" />
      {verdict}
    </div>
  );
}

export default function TextVerifyPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const isUrl = input.startsWith("http://") || input.startsWith("https://");
      const data = await satya.textVerify(isUrl ? { url: input } : { text: input });
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analysis failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 font-sans">
      {/* Header */}
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
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-bronze uppercase tracking-widest bg-bronze/10 px-3 py-1 rounded-full mb-4">
            <Scan className="w-3 h-3" /> Engine 1 — LLM Phishing Analyzer
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight text-parchment-100">
            Text & URL<br/><span className="text-bronze">Scam Detector</span>
          </h1>
          <p className="text-ink-400 mt-4 max-w-xl leading-relaxed">
            Paste any suspicious WhatsApp message, SMS, email, or URL. Our LLM engine cross-references it against known securities scam patterns from SEBI, NSE, and RBI.
          </p>
        </motion.div>

        {/* Input Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
          <div className="relative">
            <textarea
              className="w-full bg-ink-800 border border-ink-700 rounded-2xl p-5 text-parchment-100 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:border-bronze transition-colors placeholder:text-ink-500 min-h-[160px]"
              placeholder="Paste suspicious message, email content, or URL here..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 text-xs text-ink-500 font-mono">{input.length}/8000</div>
          </div>

          {/* Quick Example Buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-ink-500 font-bold uppercase tracking-wider self-center">Try an example:</span>
            {RISK_EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setInput(ex)}
                className="text-xs px-3 py-1.5 bg-ink-800 border border-ink-700 rounded-full text-ink-300 hover:border-bronze hover:text-bronze transition-colors">
                Example {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={analyze}
            disabled={loading || !input.trim()}
            className="mt-4 w-full py-4 bg-bronze text-white font-bold uppercase tracking-widest rounded-xl hover:bg-bronze/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Llama-3...
              </>
            ) : (
              <><Scan className="w-4 h-4" /> Analyze for Scams</>
            )}
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950 border border-red-700 text-red-300 text-sm font-medium mb-6">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Primary verdict card */}
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                  <div>
                    <VerdictBadge verdict={result.verdict} />
                    <p className="text-parchment-400 mt-3 leading-relaxed max-w-lg">{result.explanation}</p>
                    {result.impersonatedEntity && (
                      <p className="mt-2 text-sm text-red-400 font-bold">⚠️ Impersonates: {result.impersonatedEntity}</p>
                    )}
                    {result.scamType && (
                      <p className="mt-1 text-xs text-ink-400 font-bold uppercase tracking-wider">Scam Type: {result.scamType}</p>
                    )}
                  </div>
                  <RiskMeter score={result.riskScore ?? 0} />
                </div>

                {/* Red Flags */}
                {result.redFlags?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> Red Flags Detected
                    </h3>
                    <div className="space-y-2">
                      {result.redFlags.map((flag: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-red-950/50 border border-red-900 rounded-lg text-sm text-red-300">
                          <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span> {flag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safe Indicators */}
                {result.safeIndicators?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Safe Indicators
                    </h3>
                    <div className="space-y-2">
                      {result.safeIndicators.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-emerald-950/50 border border-emerald-900 rounded-lg text-sm text-emerald-300">
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span> {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Advice */}
                <div className="p-4 bg-bronze/10 border border-bronze/30 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-bronze mb-2">Safety Advice</h3>
                  <p className="text-sm text-parchment-300 leading-relaxed">{result.safetyAdvice}</p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-ink-500 font-mono">
                  <span>Engine: {result.engine} • Confidence: {result.confidenceLevel}</span>
                  <span>{new Date(result.analyzedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
