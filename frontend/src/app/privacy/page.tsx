import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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

        <h1 className="font-display font-black text-5xl uppercase text-parchment-100 mb-8">Privacy Policy</h1>
        <p className="text-ink-500 font-bold uppercase tracking-widest text-sm mb-12">Last Updated: July 2026</p>

        <div className="prose prose-invert prose-p:text-ink-300 prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:text-parchment-100">
          <h2>1. Introduction</h2>
          <p>
            SatyaCheck ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform or use our market integrity verification services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the platform. This includes names, email addresses, and access roles (Retail Investor or Market Regulator).
            <br /><br />
            When you use our verification engines, we process the content you submit (messages, images, audio transcripts, market claims) solely for the purpose of delivering a verification result. <strong>We do not store submitted content beyond the active session.</strong>
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use your information to provide, operate, and maintain our platform, to deliver AI-powered verification results, and to communicate with you about platform updates and security alerts. Verification scan results may be logged in aggregate (without PII) to improve our detection models.
          </p>

          <h2>4. Data Storage and Security</h2>
          <p>
            Our platform relies on Clerk for bank-grade authentication. All communication between your browser and our servers is encrypted in transit. We do not sell your data to any third parties. AI inference is performed via Groq's API infrastructure under data processor agreements.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@satyacheck.io" className="text-bronze hover:underline">privacy@satyacheck.io</a>
          </p>
        </div>
      </main>
    </div>
  );
}
