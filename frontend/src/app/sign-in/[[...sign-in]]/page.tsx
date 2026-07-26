"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { User, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: "verify",
      title: "Retail Investor",
      description: "Verify suspicious messages, calls, and media targeting you.",
      icon: User,
      demoEmail: "investor@satyacheck.io",
      redirect: "/verify",
    },
    {
      id: "cognita",
      title: "Market Regulator",
      description: "Use Cognita AI and all 4 verification engines for compliance.",
      icon: Shield,
      demoEmail: "regulator@satyacheck.io",
      redirect: "/cognita",
    },
  ];

  if (selectedRole) {
    const roleConfig = roles.find(r => r.id === selectedRole);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 p-6 relative">
        <div className="fixed inset-0 pointer-events-none opacity-10 z-0"
          style={{ backgroundImage: "radial-gradient(circle, #C9975720 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="z-10 w-full max-w-md flex flex-col items-center">
          <button
            onClick={() => setSelectedRole(null)}
            className="self-start mb-6 flex items-center gap-2 text-ink-400 hover:text-bronze text-sm font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="w-full bg-bronze/10 border border-bronze/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-bronze mb-1">Demo Environment</p>
            <p className="text-sm text-ink-300">
              Sign in as <strong className="text-parchment-100 font-mono bg-ink-800 px-2 py-1 rounded ml-1">{roleConfig?.demoEmail}</strong>
            </p>
          </div>
          <SignIn fallbackRedirectUrl={`/${roleConfig?.redirect || "verify"}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink-900 p-6 relative">
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0"
        style={{ backgroundImage: "radial-gradient(circle, #C9975720 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="z-10 w-full max-w-2xl">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8 group">
            <img src="/logo.svg" alt="SatyaCheck" className="w-12 h-12 mx-auto group-hover:scale-110 transition-transform duration-500" />
          </Link>
          <h1 className="font-display font-black text-4xl uppercase text-parchment-100 mb-2">
            Satya<span className="text-bronze">Check</span>
          </h1>
          <p className="text-ink-400 font-medium text-sm tracking-widest uppercase">Select your access level</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedRole(role.id)}
                className="bg-ink-800 p-8 rounded-2xl border border-ink-700 hover:border-bronze hover:shadow-2xl hover:shadow-bronze/10 transition-all flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon className="w-32 h-32 text-bronze" />
                </div>
                <div className="w-16 h-16 bg-ink-700 rounded-full flex items-center justify-center mb-6 group-hover:bg-bronze/10 transition-colors border border-ink-600 group-hover:border-bronze/30">
                  <Icon className="w-8 h-8 text-ink-400 group-hover:text-bronze transition-colors" />
                </div>
                <h2 className="font-display font-bold text-2xl uppercase text-parchment-100 mb-2">{role.title}</h2>
                <p className="text-ink-400 text-sm font-medium">{role.description}</p>
              </motion.button>
            );
          })}
        </div>
        <p className="text-center text-xs text-ink-500 mt-8">
          <Link href="/" className="hover:text-bronze transition-colors">← Back to SatyaCheck</Link>
        </p>
      </div>
    </div>
  );
}
