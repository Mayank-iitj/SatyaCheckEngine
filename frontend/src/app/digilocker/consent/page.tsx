"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { digilockerAPI } from "@/lib/api";
import { ShieldCheck, CheckCircle2, XCircle, FileText, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";

function ConsentGatewayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get("token");
  const student = searchParams.get("student") || "Student";
  const docType = searchParams.get("docType") || "Academic Records";

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [fetchToken, setFetchToken] = useState("");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid Consent Request: Missing Token");
    }
  }, [token]);

  const handleConsent = async (approved: boolean) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await digilockerAPI.approve({ consentToken: token, approved });
      if (approved) {
        setStatus("success");
        setFetchToken(res.fetchToken);
        toast.success("DigiLocker connection approved!");
      } else {
        setStatus("error");
        toast.error("Consent denied");
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process consent");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Request</h1>
        <p className="text-slate-500 mb-6">The DigiLocker authorization token is missing or malformed.</p>
        <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* DigiLocker Header */}
        <div className="bg-blue-600 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="relative z-10 bg-white p-3 rounded-full mb-3 shadow-md">
            <img src="/logo.svg" alt="ProofMind" className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-white relative z-10 tracking-wide">
            DigiLocker<span className="font-light"> Gateway</span>
          </h1>
          <p className="text-blue-100 text-sm mt-1 relative z-10 font-medium">Secure Document Sharing</p>
        </div>

        {status === "pending" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Authorization Request</h2>
            <p className="text-slate-600 text-sm text-center mb-6 leading-relaxed">
              <strong>ProofMind</strong> is requesting access to fetch your <strong className="text-blue-600">{docType}</strong> from your DigiLocker account.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">Information requested:</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>Verified Identity Profile (Name, DOB)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-slate-600">
                  <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{docType} (Read-only access)</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleConsent(false)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Deny
              </button>
              <button
                onClick={() => handleConsent(true)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Approve"}
              </button>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Consent Approved</h2>
            <p className="text-slate-600 text-sm mb-6">
              Your documents have been securely authorized for ProofMind.
            </p>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-6 text-left overflow-hidden">
              <span className="text-xs font-semibold text-slate-500 block mb-1 uppercase tracking-wider">Fetch Token</span>
              <code className="text-xs text-blue-600 break-all">{fetchToken}</code>
            </div>

            <Link href="/dashboard" className="inline-flex items-center justify-center w-full px-4 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors gap-2">
              Return to ProofMind <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Powered by National E-Governance Division
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConsentGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>}>
      <ConsentGatewayContent />
    </Suspense>
  );
}
