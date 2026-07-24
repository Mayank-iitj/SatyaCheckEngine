import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
        
        <h1 className="font-display font-black text-5xl uppercase text-ink-900 mb-8">Terms of Service</h1>
        <p className="text-ink-500 font-bold uppercase tracking-widest text-sm mb-12">Last Updated: July 2026</p>

        <div className="prose prose-slate prose-p:text-ink-600 prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:text-ink-900">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using ProofMind, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            ProofMind is a blockchain-based platform for issuing, storing, and verifying cryptographic academic credentials. 
            We provide specialized portals for Students (credential wallets), Universities (issuing), and Recruiters (verification and sourcing).
          </p>

          <h2>3. User Responsibilities</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials. 
            Universities are strictly responsible for the accuracy of the credentials they issue. 
            Once a credential is mathematically anchored to the blockchain, its cryptographic hash cannot be altered, though it can be marked as revoked by the authorized issuer.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            The platform, its original content, features, and functionality are owned by ProofMind and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            In no event shall ProofMind, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </div>
      </main>
    </div>
  );
}
