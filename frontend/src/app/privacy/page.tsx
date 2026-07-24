import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-parchment-50 text-ink-900 font-sans">
      <header className="bg-parchment-100/90 backdrop-blur-md border-b border-parchment-200 sticky top-0 z-40">
        <div className="max-w-[90rem] mx-auto px-6 h-20 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/logo.svg" alt="ProofMind Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
            <span className="font-display font-black text-2xl tracking-tight text-ink-900 uppercase">
              Proof<span className="text-bronze">Mind</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">Home</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-500 hover:text-bronze transition-colors mb-12 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        
        <h1 className="font-display font-black text-5xl uppercase text-ink-900 mb-8">Privacy Policy</h1>
        <p className="text-ink-500 font-bold uppercase tracking-widest text-sm mb-12">Last Updated: July 2026</p>

        <div className="prose prose-slate prose-p:text-ink-600 prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:text-ink-900">
          <h2>1. Introduction</h2>
          <p>
            ProofMind ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform or use our services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the platform. This includes names, email addresses, and roles (Student, University, Recruiter, Admin). 
            Crucially, <strong>we do not store Personally Identifiable Information (PII) on the blockchain</strong>. Only cryptographic hashes (SHA-256) of your academic credentials are anchored to the Polygon network.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use your information to provide, operate, and maintain our platform, to process verifiable credentials, to match students with job opportunities via our AI engine, and to communicate with you about updates and security alerts.
          </p>

          <h2>4. Data Storage and Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. Our platform relies on Clerk for bank-grade authentication. Verified credentials are encrypted and stored on IPFS, with only their immutable hash footprint stored on the blockchain.
          </p>

          <h2>5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@proofmind.io" className="text-bronze hover:underline">privacy@proofmind.io</a>
          </p>
        </div>
      </main>
    </div>
  );
}
