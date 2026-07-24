"use client";

import { useState } from "react";
import { SignIn } from "@clerk/nextjs";
import { GraduationCap, Building2, Briefcase, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: "student",
      title: "Student",
      description: "Access your digital wallet and career matches.",
      icon: GraduationCap,
      demoEmail: "student@university.edu"
    },
    {
      id: "university",
      title: "University",
      description: "Issue credentials and manage verification.",
      icon: Building2,
      demoEmail: "harvard@proofmind.edu"
    },
    {
      id: "recruiter",
      title: "Recruiter",
      description: "Source verified talent and run AI matches.",
      icon: Briefcase,
      demoEmail: "recruiter@google.com"
    },
    {
      id: "admin",
      title: "Admin",
      description: "Manage platform integrity and institutions.",
      icon: ShieldAlert,
      demoEmail: "admin@proofmind.edu"
    }
  ];

  if (selectedRole) {
    const roleConfig = roles.find(r => r.id === selectedRole);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-parchment-50 p-6 relative">
        <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0 opacity-50" />
        
        <div className="z-10 w-full max-w-md flex flex-col items-center">
          <button 
            onClick={() => setSelectedRole(null)}
            className="self-start mb-6 flex items-center gap-2 text-ink-500 hover:text-bronze text-sm font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Roles
          </button>

          <div className="w-full bg-bronze/10 border border-bronze/20 rounded-xl p-4 mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-bronze mb-1">Demo Environment Tip</p>
            <p className="text-sm text-ink-600">
              To access the {roleConfig?.title} portal, sign in using <br/>
              <strong className="text-ink-900 font-mono mt-1 inline-block bg-white px-2 py-1 rounded">{roleConfig?.demoEmail}</strong>
            </p>
          </div>

          <SignIn fallbackRedirectUrl={`/${selectedRole}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-parchment-50 p-6 relative">
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0 opacity-50" />
      
      <div className="z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-8 group">
            <img src="/logo.svg" alt="ProofMind Logo" className="w-12 h-12 mx-auto group-hover:scale-110 transition-transform duration-500" />
          </Link>
          <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-4">Select Your Role</h1>
          <p className="text-ink-600 font-medium text-sm tracking-widest uppercase">
            Choose your portal to proceed to authentication.
          </p>
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
                className="bg-white p-8 rounded-2xl border border-parchment-200 hover:border-bronze hover:shadow-lg transition-all flex flex-col items-center text-center group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Icon className="w-32 h-32 text-bronze" />
                </div>
                
                <div className="w-16 h-16 bg-parchment-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-bronze/10 transition-colors">
                  <Icon className="w-8 h-8 text-ink-600 group-hover:text-bronze transition-colors" />
                </div>
                
                <h2 className="font-display font-bold text-2xl uppercase text-ink-900 mb-2">{role.title}</h2>
                <p className="text-ink-500 text-sm font-medium">{role.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
