// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShieldCheck, Plus, Minus, ArrowRight, Scan, Shield, ChevronDown, CheckCircle2, Building2, Briefcase, Home, Activity } from "lucide-react";
import LogoLoop from "../components/LogoLoop";
import CircularGallery from "../components/CircularGallery";
import StaggeredMenu from "../components/StaggeredMenu";
import RotatingText from "../components/RotatingText";
import ScrollFloat from "../components/ScrollFloat";
import ScrollStack, { ScrollStackItem } from "../components/ScrollStack";
import ScrollVelocity from "../components/ScrollVelocity";
import FlowingMenu from "../components/FlowingMenu";
import ShapeBlur from "../components/ShapeBlur";
import CognitaAI from "../components/CognitaAI";
import Plasma from "../components/Plasma";
import FallingText from "../components/FallingText";
import VariableProximity from "../components/VariableProximity";
import StarBorder from "../components/StarBorder";
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";

function BackendSpinUpOverlay() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <StarBorder
        as="div"
        color="rgba(234, 179, 8, 1)"
        speed="3s"
        className="max-w-[200px] cursor-pointer shadow-2xl transition-all transform hover:scale-105"
        onClick={() => {
          window.open('https://satyacheckengine.onrender.com', '_blank');
          setIsVisible(false);
        }}
      >
        <div 
          ref={containerRef}
          className="p-3 flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_6px_rgba(234,179,8,0.8)]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-parchment-400">System Status</span>
          </div>
          <VariableProximity
            label="Click here to wake up backend services for AI features"
            className="text-xs font-bold text-parchment-100 leading-tight"
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 900, 'opsz' 40"
            containerRef={containerRef}
            radius={100}
            falloff="gaussian"
          />
        </div>
      </StarBorder>
    </div>
  );
}

function CanvasCircularGallery() {
  const galleryItems = [
    { image: '/gallery/1.png', text: 'Cryptographic Security' },
    { image: '/gallery/2.png', text: 'Academic Verification' },
    { image: '/gallery/3.png', text: 'Global Equivalency' },
    { image: '/gallery/4.png', text: 'AI Forensics' },
  ];

  return (
    <CircularGallery
      bend={3}
      textColor="#1C1613"
      borderRadius={0.05}
      scrollEase={0.02}
      fontUrl="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700&display=swap"
      font="bold 30px 'Plus Jakarta Sans', sans-serif"
      items={galleryItems}
    />
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const staggerMenuItems = [
    { label: 'Engines', ariaLabel: 'Go to Engines', link: '/verify' },
    { label: 'FAQ', ariaLabel: 'Go to FAQ', link: '#faq' },
    { label: 'Launch Verifier', ariaLabel: 'Launch Verifier Hub', link: '/verify' },
  ];

  const staggerSocialItems = [
    { label: 'Patient Zero Heatmap', link: '/heatmap' },
    { label: 'ZKP Whistleblower', link: '/whistleblower' },
    { label: 'Deepfake X-Ray', link: '/xray-sandbox' },
    { label: 'Clone Radar', link: '/radar' },
    { label: 'Vernacular Interceptor', link: '/vernacular' },
  ];

  const router = useRouter();

  const portalsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from(".portal-card", {
        scrollTrigger: {
          trigger: "#portals",
          start: "top center",
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
      });
    }, portalsRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 selection:bg-bronze selection:text-white overflow-hidden relative">
      {/* Global Plasma Background */}
      <div className="fixed inset-0 z-0">
        <Plasma 
          color="#ff6b35"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={0.15}
          mouseInteractive={true}
        />
      </div>

      {/* ── Marquee Top Bar ────────────────────────────────────────────── */}
      <div className="bg-ink-900 text-parchment-100 py-2.5 overflow-hidden whitespace-nowrap relative z-50">
        <div className="inline-block animate-marquee uppercase tracking-[0.15em] text-[11px] font-bold">
          AI-DRIVEN DETECTION OF SYNTHETIC MEDIA & PHISHING • CRYPTOGRAPHIC VERIFICATION OF GENUINE COMMUNICATIONS • PROTECTING INDIA'S SECURITIES MARKETS • 
        </div>
      </div>

      {/* ── Sticky Header ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-parchment-100/90 backdrop-blur-md border-b border-parchment-200">
        <div className="max-w-[90rem] mx-auto px-6 h-24 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-8 relative group cursor-pointer">
            <Link href="#problem" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">Capabilities</Link>
            <Link href="#faq" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">FAQ</Link>
          </nav>
          
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 group z-30">
            <img src="/logo.svg" alt="SatyaCheck Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
            <span className="font-display font-black text-3xl tracking-tight text-ink-900 uppercase">
              Satya<span className="text-bronze">Check</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/verify" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors hidden md:block mr-4">
              Launch Verifier
            </Link>
            <Link href="/sign-in" className="btn-primary">
              Explore Sandbox
            </Link>
            
            <div className="flex items-center ml-2 border-l border-parchment-300 pl-4 h-8">
              {/* @ts-ignore */}
              <StaggeredMenu
                position="right"
                items={staggerMenuItems}
                socialItems={staggerSocialItems}
                displaySocials={true}
                displayItemNumbering={true}
                menuButtonColor="#222"
                openMenuButtonColor="#222"
                changeMenuColorOnOpen={true}
                colors={['#e5e1d8', '#C99757']}
                logoUrl="/logo.svg"
                accentColor="#C99757"
                inlineToggle={true}
                className=""
                onMenuOpen={() => {}}
                onMenuClose={() => {}}
              />
            </div>
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
            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-[6.5rem] leading-[0.9] text-ink-900 uppercase mx-auto max-w-6xl flex flex-col items-center justify-center">
              <span>Presenting <span className="text-bronze">SatyaCheck</span></span>
              <span>Trust Net</span>
              <span className="flex items-center gap-4 flex-wrap justify-center mt-6 text-3xl md:text-5xl lg:text-6xl text-ink-600">
                <span>Built for</span>
                {/* @ts-ignore */}
                <RotatingText
                  texts={['Market Integrity', 'Authenticity', 'Provenance', 'Investors']}
                  mainClassName="text-bronze overflow-hidden inline-flex items-center justify-center"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </span>
            </h1>
            <p className="mt-8 text-ink-600 max-w-3xl mx-auto font-medium leading-relaxed text-lg">
              AI-driven detection of synthetic media & phishing, and cryptographic verification of genuine communications, for India's securities markets.
            </p>
            <div className="mt-10 flex gap-4 justify-center">
                <Link href="/verify" className="btn-primary py-3 px-8 text-sm">
                  Launch Verifier Hub
                </Link>
                <Link href="/sign-in" className="btn-secondary py-3 px-8 text-sm bg-transparent border-2 border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white transition-colors uppercase tracking-widest font-bold rounded-md">
                  Explore Sandbox
                </Link>
            </div>
          </motion.div>


        </div>
      </section>

      {/* ── LogoLoop Partners Section ──────────────────────────────────── */}
      <section className="border-t border-b border-parchment-200 bg-white py-12 relative overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-6 mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500">Trusted by top market facilitators & custodians</p>
        </div>
        
        <div className="max-w-[90rem] mx-auto px-6 overflow-hidden">
          {/* @ts-ignore */}
          <LogoLoop
            logos={[
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Building2 className="w-8 h-8 text-bronze" /> SEBI</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Activity className="w-8 h-8 text-bronze" /> NSE</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Activity className="w-8 h-8 text-bronze" /> BSE</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Briefcase className="w-8 h-8 text-bronze" /> CDSL</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Briefcase className="w-8 h-8 text-bronze" /> NSDL</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Shield className="w-8 h-8 text-bronze" /> RBI</div>, href: "#" },
            ]}
            speed={120}
            direction="left"
            logoHeight={48}
            gap={60}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#ffffff"
            ariaLabel="Partner Institutions"
          />
        </div>
      </section>

      {/* ── Giant Scroll Float Transition ──────────────────────────────── */}
      <section className="py-24 relative overflow-hidden flex items-center justify-center">
        <ScrollFloat
          animationDuration={1}
          ease='back.out(2)'
          scrollContainerRef={undefined}
          scrollStart='top bottom'
          scrollEnd='bottom center'
          stagger={0.05}
          textClassName="text-bronze font-display uppercase tracking-tighter"
        >
          PROTECTING INVESTORS
        </ScrollFloat>
      </section>

      {/* ── Scroll Velocity Divider ────────────────────────────────────── */}
      <section className="py-12 bg-bronze/10 overflow-hidden">
        <ScrollVelocity
          texts={['LLM PHISHING', 'DEEPFAKE VIDEOS', 'SYNTHETIC VOICE', 'SOCIAL MANIPULATION']} 
          velocity={80}
          className="text-bronze font-display font-black uppercase tracking-tighter mx-4"
          numCopies={4}
          damping={100}
          stiffness={800}
        />
      </section>

      {/* ── Features / Portals (Signature Brews Style) ─────────────────── */}
      <section id="portals" ref={portalsRef} className="py-24 px-6 relative z-10 bg-parchment-50 border-y border-parchment-200">
        <div className="max-w-[90rem] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <h2 className="font-display font-black text-5xl md:text-6xl text-ink-900 uppercase max-w-2xl leading-[0.9]">
              ONE TRUST <br/>
              <span className="text-bronze">FABRIC, EVERY</span> <br/> CHANNEL
            </h2>
            <div className="h-48 w-full max-w-2xl relative">
              <FallingText
                text="Verify the genuine. Don't just chase the fake. Authentication is a cryptographic guarantee. Detection alone is an arms race you eventually lose."
                highlightWords={["Verify", "genuine.", "fake.", "cryptographic", "guarantee.", "arms", "race"]}
                highlightClass="text-bronze font-bold"
                trigger="hover"
                backgroundColor="transparent"
                wireframes={false}
                gravity={0.6}
                fontSize="1.1rem"
                mouseConstraintStiffness={0.9}
                className="uppercase tracking-widest font-semibold leading-relaxed text-ink-600"
              />
            </div>
          </div>

          {/* @ts-ignore */}
          <ScrollStack
            itemDistance={100}
            itemScale={0.03}
            itemStackDistance={30}
            stackPosition="20%"
            scaleEndPosition="10%"
            baseScale={0.85}
            scaleDuration={0.5}
            rotationAmount={0}
            blurAmount={0}
            useWindowScroll={true}
            onStackComplete={undefined}
          >
            {[
              {
                title: "Patient Zero Heatmap",
                desc: "Live 3D visualization tracking fraudulent pump-and-dump rumors spreading across social networks. Maps nodes from origin to retail investors.",
                tag: "NETWORK ANALYSIS",
                link: "/heatmap"
              },
              {
                title: "ZKP Whistleblower Drop",
                desc: "Submit corporate fraud evidence with mathematical anonymity. Powered by ZK-SNARKs to protect insider identity while verifying credentials.",
                tag: "CRYPTOGRAPHY",
                link: "/whistleblower"
              },
              {
                title: "Deepfake X-Ray Sandbox",
                desc: "Interactive video player that highlights the exact anomalies (lip-sync, unnatural blinking) the AI caught using Explainable AI telemetry.",
                tag: "EXPLAINABLE AI",
                link: "/xray-sandbox"
              },
              {
                title: "Proactive Clone Radar",
                desc: "Continuous monitoring of global domain registries to intercept typo-squatting broker clones (e.g. zerodha-wealth.in) at the DNS level.",
                tag: "THREAT INTEL",
                link: "/radar"
              },
              {
                title: "Vernacular Scam Interceptor",
                desc: "Real-time analysis of regional language calls (Marathi, Hindi) with automated native-language warnings that drop active scam calls.",
                tag: "VOICE AI",
                link: "/vernacular"
              }
            ].map((portal, idx) => (
              <div 
                key={portal.title}
                className="portal-card bg-parchment-100 rounded-[2rem] p-10 border border-parchment-200 hover:-translate-y-2 transition-transform duration-500 group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-16">
                  <span className="text-xs font-bold text-bronze uppercase tracking-widest bg-bronze/10 px-3 py-1 rounded-full">
                    {portal.tag}
                  </span>
                  <Link href={portal.link} className="w-12 h-12 rounded-full border border-ink-900/10 flex items-center justify-center group-hover:bg-bronze group-hover:border-bronze group-hover:text-white transition-colors duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="mt-auto">
                  <h3 className="font-display font-black text-3xl text-ink-900 uppercase mb-4 leading-none">
                    {portal.title}
                  </h3>
                  <p className="text-ink-600 leading-relaxed font-medium mb-6">
                    {portal.desc}
                  </p>
                  <Link href={portal.link} className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-bronze hover:text-ink-900 transition-colors">
                    Launch Module <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </ScrollStack>
        </div>
      </section>

      {/* ── Brand Philosophy ───────────────────────────────────────────── */}
      <section id="problem" className="py-24 lg:py-40 px-6 relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10 pointer-events-none">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="text-bronze font-bold tracking-[0.2em] uppercase text-xs mb-8"
          >
            Why SatyaCheck?
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display font-black text-4xl md:text-5xl lg:text-7xl leading-[1.1] text-ink-900 uppercase"
          >
            THE DUAL-LAYER TRUST PROTOCOL
            <span className="block text-ink-500 text-2xl md:text-3xl lg:text-4xl mt-6 mb-12">
              SatyaCheck leads with authentication as the primary trust layer and deploys AI detection only as a safety net for unsigned content.
            </span>
          </motion.h2>
        </div>

        {/* Circular Gallery replacing ShapeBlur */}
        <div style={{ height: '600px', position: 'relative', marginTop: '4rem', zIndex: 20 }}>
          <CanvasCircularGallery />
        </div>
      </section>

      {/* ── Dual Layer Brief ────────────────────────────── */}
      <section className="py-12 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} 
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-ink-900 shadow-2xl p-8 md:p-12"
          >
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-start justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 font-black text-xl">
                    L1
                  </div>
                  <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-parchment-100">
                    Layer 1: Cryptographic Guarantee
                  </h3>
                </div>
                <p className="text-parchment-400 text-sm md:text-base leading-relaxed mb-6">
                  Signing official communications with C2PA + verifiable credentials gives investors an unforgeable, instant verification signal. Any tampering — even one changed word or video frame — is instantly detected. Legitimate senders are finite and known.
                </p>
                <ul className="text-parchment-300 space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> C2PA Provenance Standard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Registry Anchoring to SEBI's authorized entities</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> 100% Tamper Detection</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} 
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-ink-900 shadow-2xl p-8 md:p-12"
          >
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-start justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xl">
                    L2
                  </div>
                  <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-parchment-100">
                    Layer 2: AI Multi-Model Detection
                  </h3>
                </div>
                <p className="text-parchment-400 text-sm md:text-base leading-relaxed mb-6">
                  A PyTorch deepfake & anti-spoofing voice model suite combined with a RAG + LLM claim engine cross-references filings. Outputs a plain-language risk score with explanation — delivered in under 2 seconds.
                </p>
                <ul className="text-parchment-300 space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Streaming Call-Guardian for real-time synthetic voice</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Proactive Social Media Manipulation detection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> LLM-powered Phishing Classifier</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Cognita AI Section (Retained for visual consistency if needed, or we can leave it out) ─────────────────────────────────────────── */}
      <CognitaAI />

      {/* ── FAQ Section ────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6 relative z-10 bg-ink-900 text-parchment-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-bronze font-bold tracking-[0.2em] uppercase text-xs mb-4 text-center">Frequently Asked Questions</p>
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase text-center mb-6">
            BUILT TO PLUG INTO SEBI'S EXISTING TRUST FABRIC
          </h2>
          <p className="text-center text-ink-400 mb-16 max-w-2xl mx-auto">
            A modular, API-first architecture that extends SEBI Check without duplication. Each layer is independently scalable and privacy-respecting.
          </p>
          <div className="space-y-4">
            {[
              {
                q: "HOW DOES THIS ADDRESS THE VERIFICATION VOID?",
                a: "While SEBI + NPCI solved payment trust via '@valid' UPI handles, communications like WhatsApp messages, PDFs, voice calls, and video instructions remain completely unverified. SatyaCheck covers these unprotected channels."
              },
              {
                q: "WHY NOT JUST USE AI DETECTION ALONE?",
                a: "Chasing synthetic media alone means fighting every new model. Attackers iterate faster than detectors can follow. Authentication is a cryptographic guarantee that stops the arms race entirely for legitimate communications."
              },
              {
                q: "IS IT ACCESSIBLE TO FIRST-GENERATION INVESTORS?",
                a: "Yes. With Bhashini integration for Indian languages, full support is provided across WhatsApp, browser extensions, and web apps, ensuring every retail investor can access protection in their native tongue."
              },
              {
                q: "DO YOU PROVE YOUR PERFORMANCE?",
                a: "Absolutely. We perform rigorous benchmarking across text, video, and audio channels with 100% tamper detection on C2PA artifacts and high precision/recall validated on FaceForensics++, ASVspoof, and a custom Indian securities-scam corpus."
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
                Satya<span className="text-bronze">Check</span>
              </span>
              <p className="text-ink-400 font-medium text-sm">
                Protecting Investors and Market Integrity. SatyaCheck — before you trust it, verify it.
              </p>
              <div className="mt-4">
                <Link href="/verify" className="btn-primary py-2 px-6 text-sm">
                  Launch Verifier Hub
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col gap-4 font-display font-bold text-lg uppercase h-[300px] relative w-[200px]">
              <FlowingMenu 
                items={[
                  { link: '/about', text: 'RESOURCES', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop' },
                  { link: '#portals', text: 'CAPABILITIES', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop' },
                  { link: '#problem', text: 'WHY US', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop' },
                  { link: '#faq', text: 'FAQ', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop' }
                ]}
                bgColor="transparent"
                textColor="#D8C8B8" /* parchment-100 */
                borderColor="#3F3F46" /* ink-800 */
                marqueeBgColor="#8B5E34" /* bronze */
                marqueeTextColor="#FCF9F6"
              />
            </div>
            <div className="flex flex-col gap-4 font-display font-bold text-lg uppercase text-right">
              <a href="https://github.com/satyacheck" className="hover:text-bronze transition-colors">GITHUB</a>
              <a href="https://linkedin.com/company/satyacheck" className="hover:text-bronze transition-colors">LINKEDIN</a>
              <a href="https://twitter.com/satyacheck" className="hover:text-bronze transition-colors">TWITTER</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-ink-800 text-ink-500 text-sm font-medium">
            <p>© 2026 SatyaCheck Trust Network. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0 uppercase font-bold tracking-widest text-xs">
              <Link href="#portals" className="hover:text-parchment-100 transition-colors">Capabilities</Link>
              <Link href="#problem" className="hover:text-parchment-100 transition-colors">Why SatyaCheck?</Link>
              <Link href="#faq" className="hover:text-parchment-100 transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* ── Giant Background Watermark ─────────────────────────────────── */}
      <div className="relative w-full flex justify-center overflow-hidden select-none bg-ink-900 pt-8 pb-4 border-t border-ink-800">
        <span 
          className="text-[18vw] font-black tracking-tighter leading-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.01))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          SatyaCheck
        </span>
      </div>
      
      {/* ── Backend Spin-Up Overlay ────────────────────────────────────── */}
      <BackendSpinUpOverlay />
    </div>
  );
}
