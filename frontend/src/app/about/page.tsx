"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight, Building2, Globe, Shield, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 selection:bg-bronze selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />

      {/* Header */}
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
            <Link href="/verify" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">Verify</Link>
            <Link href="/sign-in" className="btn-primary">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 pt-20 pb-32">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display font-black text-5xl md:text-7xl uppercase text-ink-900 mb-6 leading-[0.9]">
              Trust Every <span className="text-bronze">Degree</span>. <br />
              Verify Every <span className="text-bronze">Achievement</span>.
            </h1>
            <p className="text-ink-600 font-medium max-w-2xl mx-auto text-lg leading-relaxed mb-10">
              ProofMind is revolutionizing academic credentials by leveraging blockchain technology to completely eliminate credential fraud, while giving students absolute ownership of their achievements.
            </p>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="beanro-card p-10 bg-white"
            >
              <h2 className="font-display font-black text-3xl uppercase text-ink-900 mb-6">Our Mission</h2>
              <p className="text-ink-600 leading-relaxed mb-6">
                In a world where degree mills and fabricated resumes run rampant, verifying academic credentials has become a slow, expensive, and manual process. 
              </p>
              <p className="text-ink-600 leading-relaxed">
                ProofMind replaces phone calls and emails to university registrars with instantaneous cryptographic verification on the Polygon blockchain. If a university issues it on ProofMind, it is mathematically guaranteed to be authentic.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="bg-parchment-200 p-6 rounded-2xl border border-parchment-300">
                <Shield className="w-8 h-8 text-bronze mb-4" />
                <h3 className="font-bold text-ink-900 uppercase tracking-widest text-sm mb-2">Immutable</h3>
                <p className="text-xs text-ink-600 leading-relaxed">Records stored on Polygon cannot be altered or forged.</p>
              </div>
              <div className="bg-parchment-200 p-6 rounded-2xl border border-parchment-300">
                <Globe className="w-8 h-8 text-bronze mb-4" />
                <h3 className="font-bold text-ink-900 uppercase tracking-widest text-sm mb-2">Global</h3>
                <p className="text-xs text-ink-600 leading-relaxed">Verify a degree from anywhere in the world instantly.</p>
              </div>
              <div className="bg-parchment-200 p-6 rounded-2xl border border-parchment-300">
                <Building2 className="w-8 h-8 text-bronze mb-4" />
                <h3 className="font-bold text-ink-900 uppercase tracking-widest text-sm mb-2">Institutional</h3>
                <p className="text-xs text-ink-600 leading-relaxed">Only verified institutions can issue credentials.</p>
              </div>
              <div className="bg-parchment-200 p-6 rounded-2xl border border-parchment-300">
                <Zap className="w-8 h-8 text-bronze mb-4" />
                <h3 className="font-bold text-ink-900 uppercase tracking-widest text-sm mb-2">Instant</h3>
                <p className="text-xs text-ink-600 leading-relaxed">No more waiting weeks for background checks.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <div className="beanro-card p-12 bg-ink-900 text-parchment-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-bronze/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <h2 className="font-display font-black text-3xl uppercase mb-6 text-white relative z-10">
              Ready to secure the future?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/sign-up" className="btn-primary flex items-center justify-center gap-2">
                Join Network <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/sign-up?role=uni" className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border border-parchment-200/20 hover:bg-parchment-100/10 flex items-center justify-center">
                Register Institution
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-parchment-200 border-t border-parchment-300 py-12 relative z-10">
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
