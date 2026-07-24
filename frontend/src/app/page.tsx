// @ts-nocheck
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ShieldCheck, Plus, Minus, ArrowRight, Scan, Shield, ChevronDown, CheckCircle2, Building2, Wallet, Briefcase, GraduationCap, Home } from "lucide-react";
import { InteractiveDoc } from "../components/InteractiveDoc";
import LogoLoop from "../components/LogoLoop";
import StaggeredMenu from "../components/StaggeredMenu";
import RotatingText from "../components/RotatingText";
import ScrollFloat from "../components/ScrollFloat";
import ScrollStack, { ScrollStackItem } from "../components/ScrollStack";
import Dock from "../components/Dock";
import ScrollVelocity from "../components/ScrollVelocity";
import FlowingMenu from "../components/FlowingMenu";
import ShapeBlur from "../components/ShapeBlur";

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const staggerMenuItems = [
    { label: 'Student', ariaLabel: 'Go to student portal', link: '/student' },
    { label: 'University', ariaLabel: 'Go to university portal', link: '/university' },
    { label: 'Recruiter', ariaLabel: 'Go to recruiter portal', link: '/recruiter' },
    { label: 'Admin', ariaLabel: 'Go to admin portal', link: '/admin' }
  ];

  const staggerSocialItems = [
    { label: 'Verify Credential', link: '/verify' },
    { label: 'Sign In', link: '/sign-in' },
  ];

  const router = useRouter();
  const dockItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', onClick: () => window.scrollTo({top: 0, behavior: 'smooth'}) },
    { icon: <Shield className="w-5 h-5" />, label: 'Verify', onClick: () => router.push('/verify') },
    { icon: <GraduationCap className="w-5 h-5" />, label: 'Student', onClick: () => router.push('/student') },
    { icon: <Building2 className="w-5 h-5" />, label: 'University', onClick: () => router.push('/university') },
  ];

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
      <header className="sticky top-0 z-30 bg-parchment-100/90 backdrop-blur-md border-b border-parchment-200">
        <div className="max-w-[90rem] mx-auto px-6 h-24 flex items-center justify-between">
          <nav className="hidden md:flex items-center gap-8 relative group cursor-pointer">
            <Link href="#problem" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">Why Us</Link>
            <Link href="#faq" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors">FAQ</Link>
          </nav>
          
          <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 group z-30">
            <img src="/logo.svg" alt="ProofMind Logo" className="w-8 h-8 group-hover:scale-110 transition-transform duration-500" />
            <span className="font-display font-black text-3xl tracking-tight text-ink-900 uppercase">
              Proof<span className="text-bronze">Mind</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/verify" className="text-xs font-bold uppercase tracking-widest hover:text-bronze transition-colors hidden md:block mr-4">
              Verify
            </Link>
            <Link href="/sign-in" className="btn-primary">
              Sign In
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
            <h1 className="font-display font-black text-6xl md:text-8xl lg:text-[7.5rem] leading-[0.9] text-ink-900 uppercase mx-auto max-w-6xl flex flex-col items-center justify-center">
              <span>Trust Every <span className="text-bronze">Degree</span></span>
              <span className="flex items-center gap-4 flex-wrap justify-center mt-2">
                <span>Verify Every</span>
                {/* @ts-ignore */}
                <RotatingText
                  texts={['Achievement', 'Transcript', 'Certificate', 'Diploma']}
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

      {/* ── LogoLoop Partners Section ──────────────────────────────────── */}
      <section className="border-t border-b border-parchment-200 bg-white py-12 relative overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-6 mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-500">Trusted By Global Institutions</p>
        </div>
        
        <div className="max-w-[90rem] mx-auto px-6 overflow-hidden">
          {/* @ts-ignore */}
          <LogoLoop
            logos={[
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Building2 className="w-8 h-8 text-bronze" /> Harvard University</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><GraduationCap className="w-8 h-8 text-bronze" /> MIT</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Building2 className="w-8 h-8 text-bronze" /> Oxford</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Briefcase className="w-8 h-8 text-bronze" /> Google</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Briefcase className="w-8 h-8 text-bronze" /> Microsoft</div>, href: "#" },
              { node: <div className="flex items-center gap-2 text-ink-900 font-bold"><Shield className="w-8 h-8 text-bronze" /> DigiLocker</div>, href: "#" },
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
          ABSOLUTE TRUST
        </ScrollFloat>
      </section>

      {/* ── Scroll Velocity Divider ────────────────────────────────────── */}
      <section className="py-12 bg-bronze/10 overflow-hidden">
        <ScrollVelocity
          texts={['ABSOLUTE TRUST', 'IMMUTABLE RECORDS', 'VERIFIED CAREERS']} 
          velocity={80}
          className="text-bronze font-display font-black uppercase tracking-tighter mx-4"
          numCopies={4}
          damping={100}
          stiffness={800}
        />
      </section>

      {/* ── Brand Philosophy ───────────────────────────────────────────── */}
      <section id="problem" className="py-24 lg:py-40 px-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-80">
          <ShapeBlur
            variation={0}
            pixelRatioProp={typeof window !== 'undefined' ? window.devicePixelRatio : 2}
            shapeSize={1.2}
            roundness={0.4}
            borderSize={0.05}
            circleSize={0.3}
            circleEdge={0.5}
          />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10 pointer-events-none">
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
              <img src="/logo.svg" alt="ProofMind Logo" className="w-8 h-8" />
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
                title: "University Portal",
                desc: "Issue, manage, and revoke credentials with batch minting directly on the blockchain.",
                tag: "ISSUER",
                href: "/university",
                color: "bg-white"
              },
              {
                title: "Student Wallet",
                desc: "Digital wallet with QR codes, sharing links, and PDF downloads for all achievements.",
                tag: "RECEIVER",
                href: "/student",
                color: "bg-parchment-100"
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
          </ScrollStack>
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
            
            <div className="flex flex-col gap-4 font-display font-bold text-lg uppercase h-[300px] relative w-[200px]">
              <FlowingMenu 
                items={[
                  { link: '/about', text: 'ABOUT', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop' },
                  { link: '/blog', text: 'BLOG', image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop' },
                  { link: '/verify', text: 'VERIFY', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop' },
                  { link: '/sign-in', text: 'LOGIN', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop' }
                ]}
                bgColor="transparent"
                textColor="#D8C8B8" /* parchment-100 */
                borderColor="#3F3F46" /* ink-800 */
                marqueeBgColor="#8B5E34" /* bronze */
                marqueeTextColor="#FCF9F6"
              />
            </div>
            <div className="flex flex-col gap-4 font-display font-bold text-lg uppercase text-right">
              <a href="https://github.com/proofmind" className="hover:text-bronze transition-colors">GITHUB</a>
              <a href="https://linkedin.com/company/proofmind" className="hover:text-bronze transition-colors">LINKEDIN</a>
              <a href="https://twitter.com/proofmind" className="hover:text-bronze transition-colors">TWITTER</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-ink-800 text-ink-500 text-sm font-medium">
            <p>© 2026 ProofMind. All rights reserved.</p>
            <div className="flex gap-8 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-parchment-100 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-parchment-100 transition-colors">Terms of Service</Link>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-bronze transition-colors flex items-center gap-1">
                BACK TO TOP
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      {/* ── Global Floating Dock ───────────────────────────────────────── */}
      <Dock 
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}
