import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 font-sans">
      <header className="bg-ink-900/90 backdrop-blur-md border-b border-ink-800 sticky top-0 z-40">
        <div className="max-w-[90rem] mx-auto px-6 h-20 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="SatyaCheck Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
            <span className="font-display font-black text-2xl tracking-tight text-parchment-100 uppercase">
              Satya<span className="text-bronze">Check</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/verify" className="text-xs font-bold uppercase tracking-widest text-ink-400 hover:text-bronze transition-colors">Verifier Hub</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-500 hover:text-bronze transition-colors mb-12 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="font-display font-black text-5xl uppercase text-parchment-100 mb-8">Terms of Service</h1>
        <p className="text-ink-500 font-bold uppercase tracking-widest text-sm mb-12">Last Updated: July 2026</p>

        <div className="prose prose-invert prose-p:text-ink-300 prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:text-parchment-100">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using SatyaCheck, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            SatyaCheck is an AI-powered market integrity verification platform for India's securities markets. We provide four specialized engines: LLM Phishing Analyzer, Deepfake Media Scanner, Claim vs. Registry Cross-Checker, and Call Guardian — designed to detect financial scams, synthetic media, and vishing attacks targeting retail investors.
          </p>

          <h2>3. Acceptable Use</h2>
          <p>
            You agree to use SatyaCheck only for lawful purposes — to verify suspicious communications and protect yourself from financial fraud. You may not use our engines to attempt to reverse-engineer scam detection thresholds, test mass phishing content, or circumvent SEBI regulations. Verification results are AI-generated and should be treated as advisory — always verify critical information with official SEBI/NSE/BSE portals.
          </p>

          <h2>4. Disclaimer of Warranties</h2>
          <p>
            SatyaCheck's verification engines use AI inference and may not catch every scam. Our verdicts are probabilistic, not legal determinations. We are not liable for financial decisions made based on our platform's output. Always report suspected fraud to SEBI SCORES (scores.sebi.gov.in) and the national cybercrime portal (cybercrime.gov.in).
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            The platform, its original content, features, and functionality are owned by SatyaCheck and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. Our engine system prompts, detection logic, and UI are proprietary.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            In no event shall SatyaCheck, nor its directors, employees, partners, agents, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages resulting from your access to or use of (or inability to use) the Service.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            Questions about these terms? Contact us at: <a href="mailto:legal@satyacheck.io" className="text-bronze hover:underline">legal@satyacheck.io</a>
          </p>
        </div>
      </main>
    </div>
  );
}
