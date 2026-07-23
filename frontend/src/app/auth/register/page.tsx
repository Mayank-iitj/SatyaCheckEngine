"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserPlus, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/register/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, otp }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Success, route to login
      router.push("/auth/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />
      
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group z-20">
        <ShieldCheck className="w-8 h-8 text-bronze group-hover:rotate-12 transition-transform duration-500" />
        <span className="font-display font-black text-2xl tracking-tight text-ink-900 uppercase">
          Proof<span className="text-bronze">Mind</span>
        </span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="beanro-card p-10">
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-3xl uppercase text-ink-900 mb-2">
              {step === 1 ? "Create Wallet" : "Verify Email"}
            </h1>
            <p className="text-ink-500 font-medium text-xs uppercase tracking-widest">
              {step === 1 ? "Register to receive digital credentials" : `We sent a code to ${formData.email}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-ink-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field pl-12"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-ink-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field pl-12"
                    placeholder="jane@student.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-ink-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input-field pl-12"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              {error && (
                <div className="text-brand-revoked text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" /> Send Verification Code
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2 text-center">6-Digit Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field text-center font-mono text-2xl tracking-[0.5em]"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="text-brand-revoked text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="btn-primary flex-1 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Register
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-parchment-200 text-center">
            <p className="text-xs text-ink-600 font-medium">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-bronze font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
