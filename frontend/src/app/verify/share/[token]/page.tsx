"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { verifyAPI } from "@/lib/api";
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, FileText, Download, Copy, Check, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDate, getCredentialTypeLabel, truncateHash } from "@/lib/utils";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export default function ShareLinkView() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credential, setCredential] = useState<any>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!token) return;
    
    const fetchCredential = async () => {
      try {
        const data = await verifyAPI.shareLink(token);
        setCredential(data.credential);
      } catch (err: any) {
        setError(err.message || "Invalid or expired share link");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCredential();
  }, [token]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    toast.success("Hash copied to clipboard!");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const downloadCertificate = async () => {
    const element = document.getElementById("certificate-view");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `ProofMind-Certificate-${credential.recipientName.replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate certificate image");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center relative">
        <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-8 h-8 border-4 border-bronze/30 border-t-bronze rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-ink-500">Retrieving Credential...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 relative">
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />
      
      {/* Header */}
      <header className="bg-parchment-100/90 backdrop-blur-md border-b border-parchment-200 sticky top-0 z-40">
        <div className="max-w-[90rem] mx-auto px-6 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <img src="/logo.svg" alt="ProofMind Logo" className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
              <span className="font-display font-black text-xl tracking-tight text-ink-900 uppercase hidden sm:block">
                Proof<span className="text-bronze">Mind</span>
              </span>
            </Link>
          </div>
          <div>
            <Link href="/verify" className="text-[10px] font-bold uppercase tracking-widest text-ink-500 hover:text-bronze transition-colors">
              Go to Verify Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase text-ink-900 mb-4">
            Shared <span className="text-bronze">Credential</span>
          </h1>
        </div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="beanro-card p-10 max-w-2xl mx-auto text-center border-brand-revoked/30 bg-red-50/50"
          >
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-brand-revoked" />
            </div>
            <h2 className="font-display font-black text-2xl text-ink-900 mb-4">Link Unavailable</h2>
            <p className="text-ink-600 mb-8">{error}</p>
            <Link href="/verify" className="btn-primary inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Go to Verify Portal
            </Link>
          </motion.div>
        ) : credential ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="beanro-card max-w-2xl mx-auto overflow-hidden relative"
          >
            {/* Status Banner */}
            <div className={`p-4 flex items-center justify-center gap-2 font-bold text-sm tracking-widest uppercase text-white ${
              credential.status === "VALID" ? "bg-brand-valid" : "bg-brand-revoked"
            }`}>
              {credential.status === "VALID" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {credential.status} CREDENTIAL
            </div>

            <div id="certificate-view" className="p-8 md:p-12 text-center bg-white relative">
              <div className="mb-8 inline-block">
                <FileText className="w-16 h-16 text-bronze/50 mx-auto" />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2">Awarded To</h3>
                  <p className="font-display font-black text-2xl text-ink-900 uppercase">
                    {credential.recipientName}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2">Credential</h3>
                  <p className="font-display font-bold text-xl text-ink-800 uppercase">
                    {credential.title}
                  </p>
                  <p className="text-sm font-medium text-ink-500 uppercase tracking-widest mt-1">
                    {getCredentialTypeLabel(credential.type)}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-parchment-200">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-2">Issuing Institution</h3>
                  <p className="font-bold text-ink-900 uppercase tracking-wide">
                    {credential.institution?.name || "Unknown Institution"}
                  </p>
                  <p className="text-xs font-medium text-ink-500 mt-1">
                    Issued on {formatDate(credential.issueDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Blockchain Details Section */}
            <div className="bg-parchment-200 p-6 sm:px-12 border-t border-parchment-300">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-500 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-bronze" /> Blockchain Record
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-parchment-300">
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1">Tx Hash</p>
                    <p className="text-xs font-mono text-ink-800 truncate pr-4">
                      {credential.polygonTxHash || "Pending..."}
                    </p>
                  </div>
                  {credential.polygonTxHash && (
                    <button 
                      onClick={() => copyToClipboard(credential.polygonTxHash)}
                      className="p-2 hover:bg-parchment-100 rounded-lg transition-colors flex-shrink-0"
                    >
                      {copiedHash ? <Check className="w-4 h-4 text-brand-valid" /> : <Copy className="w-4 h-4 text-ink-500" />}
                    </button>
                  )}
                </div>

                {credential.ipfsCid && (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-parchment-300">
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-400 mb-1">Document Storage</p>
                      <p className="text-xs font-mono text-ink-800 truncate pr-4">IPFS Hash Ready</p>
                    </div>
                    <a 
                      href={`http://127.0.0.1:8080/ipfs/${credential.ipfsCid}`}
                      target="_blank" rel="noreferrer"
                      className="p-2 hover:bg-parchment-100 rounded-lg transition-colors flex-shrink-0"
                      title="View original document"
                    >
                      <Download className="w-4 h-4 text-ink-500" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-white border-t border-parchment-200 text-center">
              <button onClick={downloadCertificate} className="btn-primary w-full flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" /> Export as Image
              </button>
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}
