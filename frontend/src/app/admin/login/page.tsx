"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await authAPI.adminLogin({ email, password });
      if (res.token) {
        localStorage.setItem("admin_token", res.token);
        localStorage.setItem("admin_user", JSON.stringify(res.user));
        toast.success("Welcome back, Admin!");
        router.push("/admin");
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-mono relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bronze/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-ink-900/80 backdrop-blur-xl border border-ink-800 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-bronze/20 flex items-center justify-center mb-4 border border-bronze/30">
            <ShieldCheck className="w-8 h-8 text-bronze" />
          </div>
          <h1 className="text-3xl font-bold text-parchment-100 mb-2">Admin Portal</h1>
          <p className="text-parchment-400 text-sm text-center">
            Sign in with your system administrator credentials.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-parchment-400 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-parchment-100 focus:outline-none focus:border-bronze transition-colors"
              placeholder="admin@proofmind.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-parchment-400 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-parchment-100 focus:outline-none focus:border-bronze transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bronze hover:bg-bronze-600 text-ink-950 font-bold py-3 rounded-xl uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In securely"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-xs text-parchment-500 hover:text-bronze transition-colors">
            ← Return to main site
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
