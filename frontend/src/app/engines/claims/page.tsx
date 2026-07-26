"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, FileSearch, AlertTriangle, CheckCircle2, ExternalLink, ChevronDown } from "lucide-react";
import { satya } from "@/lib/satya";

const CLAIM_TYPES = [
  { value: "buyback", label: "Share Buyback" },
  { value: "dividend", label: "Dividend Announcement" },
  { value: "merger", label: "Merger / Acquisition" },
  { value: "ipo", label: "IPO Allotment" },
  { value: "advisor", label: "Investment Advisor Claim" },
  { value: "general", label: "General Market Claim" },
];

const EXAMPLE_CLAIMS = [
  { claim: "Reliance Industries has announced a ₹500 per share buyback at ₹3200 price, open for 3 days only. Apply via this link immediately.", company: "Reliance Industries", claimType: "buyback" },
  { claim: "SEBI-registered advisor Mr. Rajesh Sharma guarantees 40% monthly returns through his algo trading system. First month free, then ₹5000/month.", company: "", claimType: "advisor" },
  { claim: "You have been allotted 100 shares in the Upcoming IPO. Pay ₹8000 processing fee to our UPI ID to release your allotment before 6 PM today.", company: "", claimType: "ipo" },
];

function VerdictChip({ verdict }: { verdict: string }) {
  const map: Record<string, string> = {
    VERIFIED: "bg-emerald-950 border-emerald-600 text-emerald-400",
    LIKELY_FAKE: "bg-red-950 border-red-600 text-red-400",
    MISLEADING: "bg-orange-950 border-orange-600 text-orange-400",
    SUSPICIOUS: "bg-yellow-950 border-yellow-600 text-yellow-400",
    UNVERIFIABLE: "bg-ink-800 border-ink-600 text-ink-300",
  };
  return <span className={`inline-block px-4 py-2 rounded-full border font-bold uppercase tracking-widest text-sm ${map[verdict] || map.UNVERIFIABLE}`}>{verdict.replace(/_/g, " ")}</span>;
}

function RiskTag({ level }: { level: string }) {
  const map: Record<string, string> = {
    HIGH: "bg-red-500 text-white",
    MEDIUM: "bg-orange-500 text-white",
    LOW: "bg-yellow-500 text-black",
    SAFE: "bg-emerald-500 text-white",
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${map[level] || "bg-ink-600 text-white"}`}>{level} RISK</span>;
}

export default function ClaimVerifyPage() {
  const [claim, setClaim] = useState("");
  const [company, setCompany] = useState("");
  const [claimType, setClaimType] = useState("general");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await satya.claimVerify({ claim, company, claimType });
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const fillExample = (ex: typeof EXAMPLE_CLAIMS[0]) => {
    setClaim(ex.claim);
    setCompany(ex.company);
    setClaimType(ex.claimType);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 font-sans">
      <header className="border-b border-ink-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-ink-900/90 backdrop-blur">
        <Link href="/verify" className="flex items-center gap-2 text-ink-400 hover:text-parchment-100 transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Verifier Hub
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">NSE + SEBI Live</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full mb-4">
            <FileSearch className="w-3 h-3" /> Engine 3 — Registry Cross-Checker
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">
            Claim vs. SEBI<br /><span className="text-emerald-400">Registry</span>
          </h1>
          <p className="text-ink-400 mt-4 max-w-xl leading-relaxed">
            Cross-reference any market-moving claim against live NSE/BSE filings and SEBI's intermediary registry. Detects fake buybacks, bogus advisors, and forged announcements.
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2 block">Market Claim *</label>
            <textarea
              value={claim}
              onChange={e => setClaim(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-xl p-4 text-parchment-100 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-ink-500 min-h-[120px]"
              placeholder="Paste the suspicious market claim, announcement, or message here..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2 block">Company / Entity (optional)</label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-xl p-4 text-parchment-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-ink-500"
                placeholder="e.g. Reliance Industries, Zerodha"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2 block">Claim Type</label>
              <div className="relative">
                <select
                  value={claimType}
                  onChange={e => setClaimType(e.target.value)}
                  className="w-full bg-ink-800 border border-ink-700 rounded-xl p-4 text-parchment-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                >
                  {CLAIM_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Examples */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-ink-500 font-bold uppercase tracking-wider">Examples:</span>
            {EXAMPLE_CLAIMS.map((ex, i) => (
              <button key={i} onClick={() => fillExample(ex)}
                className="text-xs px-3 py-1.5 bg-ink-800 border border-ink-700 rounded-full text-ink-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors">
                {ex.claimType.replace(/_/g, " ")} scam
              </button>
            ))}
          </div>

          <button onClick={analyze} disabled={loading || !claim.trim()}
            className="w-full py-4 bg-emerald-700 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Querying NSE + SEBI + LLM...</>
            ) : (
              <><FileSearch className="w-4 h-4" /> Cross-Reference Against Registry</>
            )}
          </button>
        </motion.div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950 border border-red-700 text-red-300 text-sm font-medium mb-6">⚠️ {error}</div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Primary Verdict */}
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <VerdictChip verdict={result.verdict} />
                  <RiskTag level={result.riskLevel} />
                  <span className="text-xs font-mono text-ink-400">Confidence: {result.confidence}%</span>
                </div>

                <p className="text-parchment-300 leading-relaxed mb-6 max-w-2xl">{result.explanation}</p>

                {/* Live Data Status */}
                <div className="flex gap-3 mb-6">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${result.liveDataFetched?.nse ? "bg-emerald-950 border-emerald-700 text-emerald-400" : "bg-ink-800 border-ink-700 text-ink-400"}`}>
                    NSE {result.liveDataFetched?.nse ? "✓ Live" : "⚑ Unavailable"}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-bold border ${result.liveDataFetched?.sebi ? "bg-emerald-950 border-emerald-700 text-emerald-400" : "bg-ink-800 border-ink-700 text-ink-400"}`}>
                    SEBI {result.liveDataFetched?.sebi ? "✓ Live" : "⚑ Unavailable"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Discrepancies */}
                  {result.discrepancies?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Discrepancies Found
                      </h3>
                      <div className="space-y-2">
                        {result.discrepancies.map((d: string, i: number) => (
                          <div key={i} className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 px-3 py-2 rounded-lg flex items-start gap-2">
                            <span className="flex-shrink-0 text-red-500">✗</span>{d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Red Flags */}
                  {result.redFlags?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Regulatory Red Flags</h3>
                      <div className="space-y-2">
                        {result.redFlags.map((f: string, i: number) => (
                          <div key={i} className="text-sm text-orange-300 bg-orange-950/40 border border-orange-900/50 px-3 py-2 rounded-lg flex items-start gap-2">
                            <span className="flex-shrink-0">⚑</span>{f}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Matched Facts */}
                {result.matchedFacts?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3" /> Facts That Check Out
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedFacts.map((f: string, i: number) => (
                        <span key={i} className="text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-900 px-3 py-1.5 rounded-full">✓ {f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Official Process */}
                {result.officialProcess && (
                  <div className="mt-5 p-4 bg-indigo-950/50 border border-indigo-800 rounded-xl">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">How This Should Look If Legitimate</h3>
                    <p className="text-sm text-indigo-200 leading-relaxed">{result.officialProcess}</p>
                  </div>
                )}

                {/* Sources */}
                {result.sources?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Verify On Official Sources</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "NSE Corporate Filings", url: "https://www.nseindia.com/companies-listing/corporate-filings-announcements" },
                        { label: "BSE Announcements", url: "https://www.bseindia.com/corporates/ann.html" },
                        { label: "SEBI SCORES", url: "https://scores.sebi.gov.in/" },
                        { label: "SEBI Intermediary", url: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRegisteredIntermediary=yes" },
                      ].map((src, i) => (
                        <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-bronze border border-bronze/30 bg-bronze/10 px-3 py-1.5 rounded-full hover:bg-bronze/20 transition-colors">
                          {src.label} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 p-4 bg-bronze/10 border border-bronze/30 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-bronze mb-2">Safety Advice</h3>
                  <p className="text-sm text-parchment-300">{result.safetyAdvice}</p>
                </div>
                <p className="mt-4 text-xs text-ink-500 font-mono">Engine: {result.engine} • {new Date(result.analyzedAt).toLocaleTimeString()}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
