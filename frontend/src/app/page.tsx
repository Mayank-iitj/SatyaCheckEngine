"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShieldCheck, Plus, Minus, ArrowRight, Scan, Shield } from "lucide-react";
import { InteractiveDoc } from "../components/InteractiveDoc";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 selection:bg-bronze selection:text-white overflow-hidden relative">
      
      {/* Global Background Grid Lines */}
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />

      {/* ── Marquee Top Bar ────────────────────────────────────────────── */}
      <div className="bg-ink-900 text-parchment-100 py-2.5 overflow-hidden whitespace-nowrap relative z-50">
        <div className="inline-block animate-marquee uppercase tracking-[0.15em] text-[11px] font-bold">
          EXPERIENCE TAMPER-PROOF ACADEMIC CREDENTIALS IN EVERY SCAN — SECURE YOUR FUTURE • EXPERIENCE TAMPER-PROOF ACADEMIC CREDENTIALS IN EVERY SCAN — SECURE YOUR FUTURE • EXPERIENCE TAMPER-PROOF ACADEMIC CREDENTIALS IN EVERY SCAN — SECURE YOUR FUTURE • EXPERIENCE TAMPER-PROOF ACADEMIC CREDENTIALS IN EVERY SCAN — SECURE YOUR FUTURE • 
        </div>
      </div>

      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-parchment-100/90 backdrop-blur-md border-b border-parchment-200">
        <div className="max-w-[90rem] mx-auto px-6 h-24 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#problem" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">Why Us</Link>
            <Link href="#portals" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">Portals</Link>
            <Link href="#faq" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">FAQ</Link>
          </nav>
          
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 group">
            <ShieldCheck className="w-8 h-8 text-bronze group-hover:rotate-12 transition-transform duration-500" />
            <span className="font-display font-black text-3xl tracking-tight text-ink-900 uppercase">
              Proof<span className="text-bronze">Mind</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/verify" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors hidden md:block mr-4">
              Verify
            </Link>
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 px-6 z-10 overflow-hidden">
        <div className="max-w-[90rem] mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative z-20"
          >
            <h1 className="font-display font-black text-6xl md:text-8xl lg:text-[7.5rem] leading-[0.9] text-ink-900 uppercase mx-auto max-w-6xl">
              Trust Every <span className="text-bronze">Degree</span><br/>
              Verify Every <span className="text-bronze">Achievement</span>
            </h1>
          </motion.div>

          {/* Left Interactive 3D Document */}
          <motion.div style={{ y: yHero }} className="absolute -left-[40%] lg:-left-[30%] xl:-left-[20%] 2xl:-left-[10%] top-40 w-[400px] lg:w-[500px] z-10 h-[600px] hidden md:block opacity-80 hover:opacity-100 transition-opacity">
            <InteractiveDoc />
          </motion.div>

          {/* Right Interactive 3D Document */}
          <motion.div style={{ y: yHero }} className="absolute -right-[40%] lg:-right-[30%] xl:-right-[20%] 2xl:-right-[10%] top-40 w-[400px] lg:w-[500px] z-10 h-[600px] hidden md:block opacity-80 hover:opacity-100 transition-opacity">
            <InteractiveDoc />
          </motion.div>
        </div>
      </section>

      {/* ── Brand Philosophy ───────────────────────────────────────────── */}
      <section id="problem" className="py-24 lg:py-40 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="text-bronze font-bold tracking-[0.2em] uppercase text-xs mb-8"
          >
            About ProofMind
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display font-black text-4xl md:text-5xl lg:text-7xl leading-[1.1] text-ink-900 uppercase"
          >
            AT PROOFMIND, WE BELIEVE AN ACADEMIC RECORD IS 
            <span className="inline-flex items-center justify-center mx-4 align-middle bg-parchment-50 w-24 h-16 rounded-full border border-parchment-200 shadow-sm relative -top-2">
              <ShieldCheck className="w-8 h-8 text-bronze" />
            </span>
            MORE THAN JUST PAPER — IT'S A CRYPTOGRAPHIC PROOF. 
            <span className="text-ink-500">WE ELIMINATE FRAUD THROUGH BLOCKCHAIN IMMUTABILITY.</span>
          </motion.h2>
        </div>
      </section>

      {/* ── Features / Portals (Signature Brews Style) ─────────────────── */}
      <section id="portals" className="py-24 px-6 relative z-10 bg-parchment-50 border-y border-parchment-200">
        <div className="max-w-[90rem] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <h2 className="font-display font-black text-5xl md:text-6xl text-ink-900 uppercase max-w-2xl leading-[0.9]">
              EXPLORE OUR <br/>
              <span className="text-bronze">POWERFUL PORTALS</span>
            </h2>
            <p className="text-ink-600 max-w-sm uppercase text-xs tracking-widest font-semibold leading-relaxed">
              A selection of purpose-built interfaces crafted to delight every stakeholder in the academic ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "University Portal",
                desc: "Issue, manage, and revoke credentials with batch minting directly on the blockchain.",
                tag: "ISSUER",
                href: "/university"
              },
              {
                title: "Student Wallet",
                desc: "Digital wallet with QR codes, sharing links, and PDF downloads for all achievements.",
                tag: "RECEIVER",
                href: "/student"
              },
              {
                title: "Recruiter Verification",
                desc: "Instant QR scanning and bulk CSV verification — absolutely no login required.",
                tag: "VERIFIER",
                href: "/verify"
              }
            ].map((portal, idx) => (
              <motion.div 
                key={portal.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-parchment-100 rounded-[2rem] p-10 border border-parchment-200 hover:-translate-y-2 transition-transform duration-500 group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-16">
                  <span className="text-xs font-bold text-bronze uppercase tracking-widest bg-bronze/10 px-3 py-1 rounded-full">
                    {portal.tag}
                  </span>
                  <div className="w-12 h-12 rounded-full border border-ink-900/10 flex items-center justify-center group-hover:bg-bronze group-hover:border-bronze group-hover:text-white transition-colors duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="mt-auto">
                  <h3 className="font-display font-black text-3xl text-ink-900 uppercase mb-4 leading-none">
                    {portal.title}
                  </h3>
                  <p className="text-ink-600 leading-relaxed font-medium">
                    {portal.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Pillars ──────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-[90rem] mx-auto grid md:grid-cols-3 gap-16 md:gap-8">
          {[
            {
              num: "01",
              title: "IMMUTABLE RECORDS",
              desc: "Every credential is cryptographically hashed and permanently anchored on Polygon. Once issued, it can never be altered or forged."
            },
            {
              num: "02",
              title: "INSTANT VERIFICATION",
              desc: "Employers scan a QR or paste a hash and get an instant, tamper-proof authenticity confirmation in under 2 seconds."
            },
            {
              num: "03",
              title: "DECENTRALIZED STORAGE",
              desc: "Actual certificate files are pinned securely to IPFS, ensuring 100% uptime and eliminating single points of failure."
            }
          ].map((pillar, idx) => (
            <motion.div 
              key={pillar.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="relative"
            >
              <div className="font-display font-black text-8xl text-parchment-300 absolute -top-12 -left-4 z-0 pointer-events-none">
                {pillar.num}
              </div>
              <div className="relative z-10">
                <h3 className="font-display font-black text-2xl text-ink-900 uppercase mb-4">{pillar.title}</h3>
                <p className="text-ink-600 leading-relaxed font-medium">{pillar.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 relative z-10 bg-ink-900 text-parchment-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-center mb-16">
            FREQUENTLY ASKED
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "HOW LONG DOES VERIFICATION TAKE?",
                a: "Verification is instant. The moment a QR code is scanned or a hash is entered, our system checks the Polygon blockchain and returns the authenticity status in under 2 seconds."
              },
              {
                q: "IS STUDENT DATA PUBLIC ON THE BLOCKCHAIN?",
                a: "No. ProofMind never stores PII (Personally Identifiable Information) on the blockchain. We only store a cryptographic SHA-256 hash of the credential data, ensuring complete GDPR compliance."
              },
              {
                q: "WHAT IF AN INSTITUTION REVOKES A DEGREE?",
                a: "Institutions can revoke credentials through their portal. The revocation is recorded on-chain, and any subsequent verification attempts will immediately show a 'REVOKED' status."
              },
              {
                q: "DO EMPLOYERS NEED AN ACCOUNT TO VERIFY?",
                a: "No. The Verification Portal is completely public. Anyone with a credential hash, ID, or QR code can verify its authenticity without creating an account or logging in."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-ink-700/50 pb-4">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between py-4 text-left group"
                >
                  <span className="font-display font-bold text-xl uppercase group-hover:text-bronze transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-bronze ml-4 flex-shrink-0">
                    {activeFaq === idx ? <Minus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </span>
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-ink-400 pb-6 pr-12 font-medium leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-ink-900 pt-24 pb-12 px-6 border-t border-ink-800 text-parchment-100 relative z-10">
        <div className="max-w-[90rem] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
              <span className="font-display font-black text-3xl uppercase tracking-tight">
                Proof<span className="text-bronze">Mind</span>
              </span>
              <p className="text-ink-400 font-medium text-sm">
                Building trust in education through immutable digital credentials.
              </p>
            </div>
            
            <div className="flex flex-col gap-4 font-display font-bold text-lg uppercase">
              <Link href="/about" className="hover:text-bronze transition-colors">ABOUT</Link>
              <Link href="/blog" className="hover:text-bronze transition-colors">BLOG</Link>
              <Link href="/verify" className="hover:text-bronze transition-colors">VERIFY</Link>
              <Link href="/auth/login" className="hover:text-bronze transition-colors">LOGIN</Link>
            </div>



            <div className="flex flex-col gap-4 font-display font-bold text-lg uppercase text-right">
              <a href="#" className="hover:text-bronze transition-colors">GITHUB</a>
              <a href="#" className="hover:text-bronze transition-colors">LINKEDIN</a>
              <a href="#" className="hover:text-bronze transition-colors">TWITTER</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-ink-800 text-ink-500 text-sm font-medium">
            <p>© 2026 ProofMind. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-parchment-100 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-parchment-100 transition-colors">Terms of Service</a>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-bronze transition-colors flex items-center gap-1">
                BACK TO TOP
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
