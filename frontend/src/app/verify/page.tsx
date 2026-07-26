"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Scan, FileText, Image, FileSearch, Phone, ArrowRight, Shield, Zap, ExternalLink, ChevronRight } from "lucide-react";

const ENGINES = [
  {
    id: "text",
    number: "01",
    title: "LLM Phishing Analyzer",
    subtitle: "Text & URL Scam Detector",
    description: "Paste any suspicious WhatsApp message, SMS, email, or URL. Detects impersonation of SEBI/RBI/NSE, pump-and-dump schemes, fake IPO allotments, and OTP harvesting.",
    href: "/engines/text",
    icon: FileText,
    color: "bronze",
    accent: "#C99757",
    bg: "from-amber-950/30 to-ink-900",
    border: "border-bronze/30 hover:border-bronze",
    tag: "LLM · Llama-3",
    examples: ["WhatsApp forwards", "Suspicious SMS", "Phishing URLs", "Email scams"],
  },
  {
    id: "media",
    number: "02",
    title: "Deepfake Media Scanner",
    subtitle: "Image & Video Authenticity",
    description: "Upload images, screenshots, or PDFs. Extracts EXIF metadata, detects editing traces, checks C2PA Content Credentials, and flags synthetic media used in financial fraud.",
    href: "/engines/media",
    icon: Image,
    color: "purple",
    accent: "#a855f7",
    bg: "from-purple-950/30 to-ink-900",
    border: "border-purple-500/30 hover:border-purple-500",
    tag: "Computer Vision · Sharp",
    examples: ["Doctored SEBI letters", "Fake portfolio screenshots", "Celebrity deepfakes", "Synthetic advisor photos"],
  },
  {
    id: "claims",
    number: "03",
    title: "Claim vs. Registry",
    subtitle: "SEBI & NSE Cross-Checker",
    description: "Cross-reference any market-moving claim against live NSE/BSE filings and SEBI's intermediary registry. Instantly flags fake buybacks, unregistered advisors, and forged corporate announcements.",
    href: "/engines/claims",
    icon: FileSearch,
    color: "emerald",
    accent: "#22c55e",
    bg: "from-emerald-950/30 to-ink-900",
    border: "border-emerald-500/30 hover:border-emerald-500",
    tag: "Live NSE + SEBI API",
    examples: ["Fake buyback notices", "Bogus dividend claims", "Unregistered advisors", "Fake IPO allotments"],
  },
  {
    id: "call-guardian",
    number: "04",
    title: "Call Guardian",
    subtitle: "Voice Scam & Vishing Detector",
    description: "Paste a call transcript or upload a recording. Detects vishing patterns, SEBI/RBI impersonation, psychological manipulation tactics, and dangerous phrases used to defraud retail investors.",
    href: "/engines/call-guardian",
    icon: Phone,
    color: "red",
    accent: "#ef4444",
    bg: "from-red-950/30 to-ink-900",
    border: "border-red-500/30 hover:border-red-500",
    tag: "Audio + NLP Analysis",
    examples: ["Fake SEBI officer calls", "Algo trading frauds", "Fake IPO lottery calls", "KYC fraud calls"],
  },
];

const STATS = [
  { label: "Engine Types", value: "4" },
  { label: "Scam Patterns", value: "40+" },
  { label: "Live Data Sources", value: "NSE + SEBI" },
  { label: "Avg. Response", value: "< 3s" },
];

export default function VerifyHubPage() {
  const [quickInput, setQuickInput] = useState("");

  const detectEngineFromInput = () => {
    const q = quickInput.trim();
    if (q.startsWith("http://") || q.startsWith("https://")) return "/engines/text";
    if (q.length < 20) return "/engines/claims";
    return "/engines/text";
  };

  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 font-sans">
      {/* Header */}
      <header className="border-b border-ink-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-ink-900/95 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="SatyaCheck" className="w-7 h-7" onError={() => {}} />
          <span className="font-display font-black text-xl uppercase text-parchment-100">
            Satya<span className="text-bronze">Check</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/cognita" className="text-xs font-bold uppercase tracking-widest text-ink-400 hover:text-bronze transition-colors">Cognita AI</Link>
          <Link href="/sign-in" className="text-xs font-bold uppercase tracking-widest bg-bronze text-white px-4 py-2 rounded-lg hover:bg-bronze/90 transition-colors">Sign In</Link>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-bronze uppercase tracking-widest bg-bronze/10 border border-bronze/20 px-4 py-2 rounded-full mb-6">
            <Shield className="w-3 h-3" /> SatyaCheck — Market Integrity Verification
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase leading-[0.9] mb-6">
            VERIFIER<br /><span className="text-bronze">HUB</span>
          </h1>
          <p className="text-ink-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Four specialized AI engines, one mission: protect India's retail investors from synthetic media scams, phishing, and market manipulation.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-black text-3xl text-bronze">{s.value}</div>
                <div className="text-xs text-ink-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Submit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="max-w-2xl mx-auto mb-20 bg-ink-800 border border-ink-700 rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3 text-bronze" /> Quick Check — auto-routes to the right engine
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && quickInput.trim()) window.location.href = `${detectEngineFromInput()}?q=${encodeURIComponent(quickInput)}`; }}
              className="flex-1 bg-ink-900 border border-ink-700 rounded-xl px-4 py-3 text-parchment-100 text-sm focus:outline-none focus:border-bronze transition-colors placeholder:text-ink-500"
              placeholder="Paste suspicious message, URL, or claim..."
            />
            <Link href={quickInput.trim() ? `${detectEngineFromInput()}` : "/engines/text"}
              className="px-5 py-3 bg-bronze text-white font-bold uppercase tracking-widest rounded-xl hover:bg-bronze/90 transition-colors text-sm flex items-center gap-2 whitespace-nowrap">
              <Scan className="w-4 h-4" /> Analyze
            </Link>
          </div>
        </motion.div>

        {/* Engine Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {ENGINES.map((engine, i) => {
            const Icon = engine.icon;
            return (
              <motion.div key={engine.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                <Link href={engine.href}
                  className={`group block bg-gradient-to-br ${engine.bg} border ${engine.border} rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${engine.accent}20`, border: `1px solid ${engine.accent}40` }}>
                        <Icon className="w-6 h-6" style={{ color: engine.accent }} />
                      </div>
                      <span className="text-ink-600 font-black text-3xl font-display">/{engine.number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-ink-500 bg-ink-800 border border-ink-700 px-2.5 py-1 rounded-full">{engine.tag}</span>
                      <div className="w-8 h-8 rounded-full border border-ink-700 flex items-center justify-center group-hover:border-current group-hover:bg-current/10 transition-all duration-300" style={{ color: engine.accent }}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <h2 className="font-display font-black text-2xl uppercase mb-1" style={{ color: engine.accent }}>
                    {engine.title}
                  </h2>
                  <p className="text-ink-400 text-xs font-bold uppercase tracking-widest mb-4">{engine.subtitle}</p>
                  <p className="text-ink-300 text-sm leading-relaxed mb-6">{engine.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {engine.examples.map(ex => (
                      <span key={ex} className="text-xs text-ink-400 bg-ink-800/80 border border-ink-700 px-2.5 py-1 rounded-full">
                        {ex}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Cognita AI Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-10 bg-ink-800 border border-ink-700 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-black text-2xl uppercase text-parchment-100 mb-2">Not sure which engine to use?</h3>
            <p className="text-ink-400 text-sm leading-relaxed max-w-xl">
              Ask Cognita AI — our securities market intelligence assistant. Describe what you received and it will guide you to the right engine, explain the risk, and cross-reference SEBI regulations.
            </p>
          </div>
          <Link href="/cognita"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-bronze text-white font-bold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-bronze/90 transition-colors text-sm whitespace-nowrap">
            Chat with Cognita AI <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Official Resources */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-10 text-center">
          <p className="text-xs text-ink-500 font-bold uppercase tracking-widest mb-4">Official Resources to Always Verify</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "SEBI SCORES", url: "https://scores.sebi.gov.in/" },
              { label: "NSE Announcements", url: "https://www.nseindia.com/companies-listing/corporate-filings-announcements" },
              { label: "BSE Filings", url: "https://www.bseindia.com/corporates/ann.html" },
              { label: "SEBI Intermediary Registry", url: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRegisteredIntermediary=yes" },
              { label: "Cybercrime Portal", url: "https://cybercrime.gov.in" },
            ].map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-ink-400 border border-ink-700 bg-ink-800 px-3 py-2 rounded-full hover:text-bronze hover:border-bronze/50 transition-colors">
                {r.label} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
