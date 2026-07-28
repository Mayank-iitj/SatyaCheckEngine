"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import TextPressure from "@/components/TextPressure";
import GradientText from "@/components/GradientText";
import DecryptedText from "@/components/DecryptedText";
import CurvedLoop from "@/components/CurvedLoop";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 font-sans selection:bg-emerald-500/30">
      <header className="border-b border-ink-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-ink-900/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-ink-400 hover:text-parchment-100 transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">SatyaCheck About</span>
        </div>
      </header>

      <main className="pb-32 overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 px-6 min-h-[70vh] flex flex-col justify-center items-center">
          <div className="absolute inset-0 flex justify-center items-center overflow-hidden pointer-events-none opacity-20">
            <div className="w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px]" />
          </div>
          
          <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
            <p className="text-emerald-400 font-bold tracking-[0.3em] uppercase text-sm mb-6 text-center">
              Our Mission
            </p>
            
            <div style={{ position: 'relative', height: '200px', width: '100%', maxWidth: '800px' }} className="my-10">
              <TextPressure
                text="THE TRUTH PROTOCOL"
                flex={true}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={true}
                textColor="#ffffff"
                strokeColor="#10b981"
                minFontSize={36}
              />
            </div>

            <div className="mt-8 text-center text-xl md:text-2xl font-medium text-ink-300 max-w-2xl mx-auto h-20">
              <DecryptedText
                text="Securing India's Financial Ecosystem"
                speed={40}
                maxIterations={15}
                characters="01!@#$%^&*"
                encryptedClassName="text-emerald-500 font-mono opacity-60"
                className="text-parchment-200"
                animateOn="view"
                revealDirection="center"
              />
            </div>
          </div>
        </section>

        {/* Mission / Context Section */}
        <section className="py-24 px-6 relative border-y border-ink-800 bg-ink-950">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 flex justify-center">
              <GradientText
                colors={["#10b981", "#3b82f6", "#f59e0b", "#10b981"]}
                animationSpeed={6}
                showBorder={true}
                className="px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest bg-ink-900 border-ink-700"
              >
                The Verification Void
              </GradientText>
            </div>
            
            <div className="space-y-8 text-lg md:text-xl text-ink-300 leading-relaxed font-medium">
              <p>
                India's digital infrastructure has revolutionized payments through UPI, anchoring trust in transactions. However, <strong className="text-parchment-100">the communication layer remains highly vulnerable</strong>.
              </p>
              <p>
                From deceptive WhatsApp messages promising 50% monthly returns, to highly sophisticated deepfake video calls impersonating SEBI officials, bad actors exploit the <strong className="text-emerald-400">verification void</strong>. 
                SatyaCheck exists to bridge this gap.
              </p>
              <p>
                By combining cryptographic watermarking (C2PA) with a multi-layered AI detection engine, we provide an unforgeable layer of truth. 
              </p>
            </div>
          </div>
        </section>

        {/* Curved Marquee Section */}
        <section className="bg-emerald-950 text-emerald-400 border-y border-emerald-900/50 py-10 relative overflow-hidden">
          <CurvedLoop 
            marqueeText="DECENTRALIZE TRUST ✦ VERIFY EVERYTHING ✦"
            speed={2}
            curveAmount={300}
            direction="left"
            interactive={true}
            className="font-display tracking-widest text-emerald-500/80"
          />
        </section>

        {/* Core Technology Matrix */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center mb-20 font-display font-black text-4xl uppercase tracking-widest text-parchment-100">
              Core Architecture
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Lock className="w-8 h-8 text-emerald-400" />,
                  title: "Cryptographic Anchors",
                  desc: "Every legitimate communication from SEBI or regulated entities is cryptographically signed using C2PA standards."
                },
                {
                  icon: <Zap className="w-8 h-8 text-blue-400" />,
                  title: "Real-Time AI Detection",
                  desc: "A sprawling multi-model PyTorch pipeline capable of detecting deepfakes, synthetic voices (like ElevenLabs), and vishing patterns in under 2 seconds."
                },
                {
                  icon: <Globe className="w-8 h-8 text-orange-400" />,
                  title: "Decentralized Registry",
                  desc: "Public keys and authorized entity hashes are anchored to the blockchain, ensuring 100% transparency and immutability."
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-ink-800 border border-ink-700 group hover:border-emerald-500/50 transition-colors">
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-parchment-100 mb-4 h-14">
                    <DecryptedText
                      text={feature.title}
                      animateOn="hover"
                      speed={30}
                      encryptedClassName="text-ink-500 font-mono"
                    />
                  </h3>
                  <p className="text-sm text-ink-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
