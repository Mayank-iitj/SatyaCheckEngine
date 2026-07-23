"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { authAPI } from "@/lib/api";
import { ShieldCheck, LogIn, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login({ email, password });
      
      setAuth(data.user, data.token);

      // Role-based routing
      if (data.user.role === "ADMIN") router.push("/admin");
      else if (data.user.role === "UNIVERSITY") router.push("/university");
      else if (data.user.role === "RECRUITER") router.push("/recruiter");
      else router.push("/student");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo helper
  const quickLogin = (role: "admin" | "uni" | "student" | "recruiter") => {
    if (role === "admin") {
      setEmail("admin@proofmind.io");
      setPassword("admin123");
    } else if (role === "uni") {
      setEmail("registrar@mit-demo.edu");
      setPassword("university123");
    } else if (role === "recruiter") {
      setEmail("hr@techcorp.demo");
      setPassword("recruiter123");
    } else {
      setEmail("alice@student.demo");
      setPassword("student123");
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="beanro-card p-10">
          <div className="text-center mb-10">
            <h1 className="font-display font-black text-3xl uppercase text-ink-900 mb-2">Welcome Back</h1>
            <p className="text-ink-500 font-medium text-xs uppercase tracking-widest">Sign in to manage your credentials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-ink-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="name@example.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  required
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
                  <LogIn className="w-4 h-4" /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-parchment-200">
            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-ink-500 mb-4">Demo Quick Login</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => quickLogin("uni")} type="button" className="text-[10px] font-bold uppercase tracking-widest bg-parchment-200 text-ink-700 py-2 rounded-lg hover:bg-parchment-300 transition-colors">University</button>
              <button onClick={() => quickLogin("student")} type="button" className="text-[10px] font-bold uppercase tracking-widest bg-parchment-200 text-ink-700 py-2 rounded-lg hover:bg-parchment-300 transition-colors">Student</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => quickLogin("recruiter")} type="button" className="text-[10px] font-bold uppercase tracking-widest bg-parchment-200 text-ink-700 py-2 rounded-lg hover:bg-parchment-300 transition-colors">Recruiter</button>
              <button onClick={() => quickLogin("admin")} type="button" className="text-[10px] font-bold uppercase tracking-widest bg-parchment-200 text-ink-700 py-2 rounded-lg hover:bg-parchment-300 transition-colors">Admin</button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-ink-600 font-medium">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-bronze font-bold hover:underline">
                Register as Student
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
