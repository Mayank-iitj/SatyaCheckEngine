"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Phone, Mic, FileText, AlertTriangle, ShieldAlert, ShieldCheck, ExternalLink } from "lucide-react";
import { satya } from "@/lib/satya";

const EXAMPLE_TRANSCRIPTS = [
  {
    label: "SEBI Freeze Scam",
    callerClaim: "SEBI Compliance Officer",
    transcript: "Hello sir, I am calling from S E B I headquarters. Your trading account has been flagged for suspicious activity.",
    audioUrl: "/audio/scam1.mp3"
  },
  {
    label: "Algo Trading Fraud",
    callerClaim: "Stock Market Expert",
    transcript: "Good morning sir. My algo trading system has given forty five percent monthly returns. I am offering you a limited slot.",
    audioUrl: "/audio/scam2.mp3"
  },
  {
    label: "Fake IPO Call",
    callerClaim: "IPO Allotment Authority",
    transcript: "Sir your name has been selected in our special I P O lottery scheme. You will receive five hundred shares.",
    audioUrl: "/audio/scam3.mp3"
  },
  {
    label: "Cyber Police Scam",
    callerClaim: "Mumbai Cyber Police",
    transcript: "Hello, this is Mumbai Cyber Police. Your Aadhaar card has been linked to money laundering. Press 1 to speak to an officer.",
    audioUrl: "/audio/scam4.mp3"
  },
  {
    label: "Lottery Scam",
    callerClaim: "Lottery Department",
    transcript: "Congratulations! You have won the lottery of twenty five lakh rupees. Please pay the processing fee to claim.",
    audioUrl: "/audio/scam5.mp3"
  }
];

function ScoreRing({ score }: { score: number }) {
  const r = 50, circ = 2 * Math.PI * r;
  const color = score >= 75 ? "#ef4444" : score >= 50 ? "#f97316" : score >= 25 ? "#eab308" : "#22c55e";
  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1f1f1f" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-[10px] text-ink-500 uppercase tracking-wider">Risk</span>
      </div>
    </div>
  );
}

export default function CallGuardianPage() {
  const [mode, setMode] = useState<"transcript" | "audio">("transcript");
  const [transcript, setTranscript] = useState("");
  const [callerClaim, setCallerClaim] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [selectedAudioUrl, setSelectedAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fillExample = (ex: typeof EXAMPLE_TRANSCRIPTS[0]) => {
    setTranscript(ex.transcript);
    setCallerClaim(ex.callerClaim);
    if (ex.audioUrl) {
      setSelectedAudioUrl(ex.audioUrl);
      setMode("audio");
    } else {
      setSelectedAudioUrl(null);
      setMode("transcript");
    }
    setAudioFile(null);
    setResult(null); setError(null);
  };

  const analyze = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await satya.callGuardian({ transcript, callerClaim, audioFile: audioFile || undefined });
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = mode === "transcript" ? transcript.trim().length >= 10 : !!audioFile;

  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 font-sans">
      <header className="border-b border-ink-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-ink-900/90 backdrop-blur">
        <Link href="/verify" className="flex items-center gap-2 text-ink-400 hover:text-parchment-100 transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Verifier Hub
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">Call Guardian Active</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest bg-red-400/10 px-3 py-1 rounded-full mb-4">
            <Phone className="w-3 h-3" /> Engine 4 — Call Guardian
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase leading-tight">
            Vishing & Voice<br /><span className="text-red-400">Scam Detector</span>
          </h1>
          <p className="text-ink-400 mt-4 max-w-xl leading-relaxed">
            Paste a call transcript or upload a call recording. Call Guardian analyzes vishing patterns, financial manipulation tactics, and SEBI/RBI impersonation — common in India's securities scam ecosystem.
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          {(["transcript", "audio"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setError(null); }}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${mode === m ? "bg-red-700 text-white" : "bg-ink-800 text-ink-400 hover:text-parchment-100 border border-ink-700"}`}>
              {m === "transcript" ? <><FileText className="w-3 h-3 inline mr-1.5" />Call Transcript</> : <><Mic className="w-3 h-3 inline mr-1.5" />Audio File</>}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2 block">Caller Claimed to Be (optional)</label>
            <input type="text" value={callerClaim} onChange={e => setCallerClaim(e.target.value)}
              className="w-full bg-ink-800 border border-ink-700 rounded-xl p-4 text-parchment-100 text-sm focus:outline-none focus:border-red-500 transition-colors placeholder:text-ink-500"
              placeholder='e.g. "SEBI Officer", "RBI Compliance", "Stock Advisor"' />
          </div>

          {mode === "transcript" ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2 block">Call Transcript *</label>
              <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-xl p-4 text-parchment-100 text-sm font-mono leading-relaxed resize-none focus:outline-none focus:border-red-500 transition-colors placeholder:text-ink-500 min-h-[160px]"
                placeholder="Type or paste the call transcript here (as accurately as possible)..." />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2 block">Audio Recording *</label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-ink-700 hover:border-red-500 rounded-2xl p-10 text-center cursor-pointer transition-colors group">
                <input ref={fileRef} type="file" className="hidden" accept="audio/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setSelectedAudioUrl(null); setResult(null); } }} />
                <Mic className="w-10 h-10 text-ink-600 group-hover:text-red-400 mx-auto mb-3 transition-colors" />
                {audioFile ? (
                  <p className="text-sm text-red-400 font-medium">✓ {audioFile.name} ({(audioFile.size / 1024).toFixed(1)} KB)</p>
                ) : selectedAudioUrl ? (
                  <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm text-red-400 font-medium">Sample loaded</p>
                    <audio controls src={selectedAudioUrl} className="w-full" />
                    <p className="text-xs text-ink-400 mt-2">Click outside to upload a different file</p>
                  </div>
                ) : (
                  <>
                    <p className="text-ink-300 font-medium">Click or drop audio file</p>
                    <p className="text-xs text-ink-500 mt-1">MP3, WAV, OGG, M4A · Max 50 MB</p>
                  </>
                )}
              </div>
              {(audioFile || selectedAudioUrl) && !transcript && (
                <p className="text-xs text-ink-400 mt-2">💡 Add the call transcript below for more accurate analysis</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <span className="text-xs text-ink-500 font-bold uppercase tracking-wider">Load sample:</span>
            {EXAMPLE_TRANSCRIPTS.map((ex, i) => (
              <button key={i} onClick={() => fillExample(ex)}
                className="text-xs px-3 py-1.5 bg-ink-800 border border-ink-700 rounded-full text-ink-300 hover:border-red-500 hover:text-red-400 transition-colors">
                {ex.label}
              </button>
            ))}
          </div>

          <button onClick={analyze} disabled={loading || !canSubmit}
            className="w-full py-4 bg-red-800 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running Call Guardian AI...</>
            ) : (
              <><Phone className="w-4 h-4" /> Analyze for Vishing / Voice Scam</>
            )}
          </button>
        </motion.div>

        {error && (
          <div className="p-4 rounded-xl bg-red-950 border border-red-700 text-red-300 text-sm font-medium mb-6">⚠️ {error}</div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 items-center mb-3">
                      {result.verdict === "SCAM_CALL" || result.verdict === "VISHING_ATTEMPT" ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold uppercase tracking-widest text-sm bg-red-950 border-red-600 text-red-400">
                          <ShieldAlert className="w-4 h-4" />{result.verdict.replace(/_/g, " ")}
                        </span>
                      ) : result.verdict === "LEGITIMATE" || result.verdict === "BENIGN" ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold uppercase tracking-widest text-sm bg-emerald-950 border-emerald-600 text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />{result.verdict.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-bold uppercase tracking-widest text-sm bg-orange-950 border-orange-600 text-orange-400">
                          <AlertTriangle className="w-4 h-4" />{result.verdict.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-400">Confidence: {result.confidenceLevel}</span>
                    </div>
                    {result.impersonatedEntity && (
                      <p className="text-sm text-red-400 font-bold mb-2">⚠️ Impersonates: {result.impersonatedEntity}</p>
                    )}
                    {result.scamCategory && (
                      <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-3">Scam Type: {result.scamCategory}</p>
                    )}
                    <p className="text-parchment-300 leading-relaxed max-w-lg">{result.explanation}</p>
                  </div>
                  <ScoreRing score={result.riskScore ?? 0} />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Vishing Patterns */}
                  {result.vishingPatterns?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Vishing Patterns Detected
                      </h3>
                      <div className="space-y-2">
                        {result.vishingPatterns.map((p: string, i: number) => (
                          <div key={i} className="text-sm text-red-300 bg-red-950/40 border border-red-900/50 px-3 py-2 rounded-lg flex items-start gap-2">
                            <span className="flex-shrink-0 text-red-500">✗</span>{p}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Psychological Tactics */}
                  {result.psychologicalTactics?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Manipulation Tactics Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.psychologicalTactics.map((t: string, i: number) => (
                          <span key={i} className="text-xs text-orange-300 bg-orange-950/50 border border-orange-900 px-3 py-1.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dangerous Phrases */}
                {result.dangerousPhrases?.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">Dangerous Phrases Found</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.dangerousPhrases.map((phrase: string, i: number) => (
                        <span key={i} className="font-mono text-xs text-red-200 bg-red-950 border border-red-800 px-3 py-1.5 rounded-lg">"{phrase}"</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Safety Advice */}
                <div className="mt-5 p-4 bg-bronze/10 border border-bronze/30 rounded-xl">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-bronze mb-2">Immediate Safety Advice</h3>
                  <p className="text-sm text-parchment-300 leading-relaxed">{result.safetyAdvice}</p>
                </div>

                {/* Report To */}
                {result.reportTo && (
                  <div className="mt-4 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-ink-400 font-bold uppercase tracking-wider">Report this scam:</span>
                    {[
                      { label: "Cybercrime Portal", url: "https://cybercrime.gov.in" },
                      { label: "SEBI SCORES", url: "https://scores.sebi.gov.in/" },
                      { label: "TRAI DND", url: "https://trai.gov.in/consumer-corner/dont-disturb" },
                    ].map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-bronze border border-bronze/30 bg-bronze/10 px-3 py-1.5 rounded-full hover:bg-bronze/20 transition-colors">
                        {r.label} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs text-ink-500 font-mono">
                  Engine: {result.engine} • {new Date(result.analyzedAt).toLocaleTimeString()}
                  {result.hasAudioFile && " • Audio file processed"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
