"use client";

import Link from "next/link";
import { ShieldCheck, ArrowLeft, Clock } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 selection:bg-bronze selection:text-white relative flex flex-col">
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />

      {/* Header */}
      <header className="bg-parchment-100/90 backdrop-blur-md border-b border-parchment-200 sticky top-0 z-40">
        <div className="max-w-[90rem] mx-auto px-6 h-20 flex items-center justify-between relative">
          <Link href="/" className="flex items-center gap-2 group">
            <ShieldCheck className="w-8 h-8 text-bronze group-hover:rotate-12 transition-transform duration-500" />
            <span className="font-display font-black text-2xl tracking-tight text-ink-900 uppercase">
              Proof<span className="text-bronze">Mind</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">About</Link>
            <Link href="/verify" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">Verify</Link>
            <Link href="/auth/login" className="btn-primary">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 text-center">
        <div className="beanro-card p-12 max-w-2xl w-full bg-white relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-bronze/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
          
          <Clock className="w-16 h-16 text-bronze mx-auto mb-8 opacity-80" />
          
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase text-ink-900 mb-4 leading-tight">
            ProofMind <span className="text-bronze">Insights</span>
          </h1>
          <p className="text-ink-600 font-medium text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Our engineering and policy team is working hard building the future of academic credentials. The blog will be launching soon with technical deep-dives into our Polygon integration, zero-knowledge proofs, and case studies.
          </p>
          
          <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Return Home
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-parchment-200 border-t border-parchment-300 py-12 relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-bronze" />
            <span className="font-display font-black text-xl uppercase text-ink-900 tracking-tight">Proof<span className="text-bronze">Mind</span></span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-500">© 2026 ProofMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
