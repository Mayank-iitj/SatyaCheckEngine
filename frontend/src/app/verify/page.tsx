"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyAPI, plagiarismAPI } from "@/lib/api";
import { Search, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Scan, Building2, FileText, QrCode, UploadCloud, Fingerprint, Activity } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import Tesseract from "tesseract.js";

function VerifyContent() {
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<"hash" | "scan" | "plagiarism">("hash");
  
  // Hash Tab State
  const [hash, setHash] = useState("");
  const [hashLoading, setHashLoading] = useState(false);
  const [hashError, setHashError] = useState<string | null>(null);
  const [hashResult, setHashResult] = useState<any | null>(null);
  
  // Scan / Upload Tab State
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [tamperWarning, setTamperWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Plagiarism Tab State
  const [plagText, setPlagText] = useState("");
  const [plagLoading, setPlagLoading] = useState(false);
  const [plagResult, setPlagResult] = useState<any | null>(null);
  const plagFileInputRef = useRef<HTMLInputElement>(null);

  // Auto-verify if hash in URL
  useEffect(() => {
    const urlHash = searchParams.get("hash");
    if (urlHash) {
      setActiveTab("hash");
      setHash(urlHash);
      autoVerify(urlHash);
    }
  }, [searchParams]);

  // --- Hash Verification ---
  const autoVerify = async (hashToVerify: string) => {
    setHashLoading(true);
    setHashError(null);
    setHashResult(null);
    try {
      const data = await verifyAPI.verify({ hash: hashToVerify });
      setHashResult(data);
    } catch (err: any) {
      setHashError(err.message || "Verification request failed");
    } finally {
      setHashLoading(false);
    }
  };

  const handleHashVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    autoVerify(hash.trim());
  };

  // --- Scan / Upload Verification ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    setOcrText("");
    setTamperWarning(null);

    try {
      // Step 1: Try to decode QR from image
      const html5QrCode = new Html5Qrcode("hidden-qr-reader"); // We need a dummy div
      
      let decodedHash = "";
      try {
        const decodedText = await html5QrCode.scanFileV2(file, false);
        // Extract hash if it's a URL
        try {
          const url = new URL(decodedText.decodedText);
          decodedHash = url.searchParams.get("hash") || decodedText.decodedText;
        } catch {
          decodedHash = decodedText.decodedText; // raw hash
        }
      } catch (qrErr) {
        // No QR found, we'll try just OCR next
        console.log("No QR code found in image");
      }

      // Step 2: Run OCR on the image
      const tesseractResult = await Tesseract.recognize(file, 'eng');
      const text = tesseractResult.data.text;
      setOcrText(text);

      // Step 3: Verify if we got a hash from QR
      if (decodedHash) {
        const data = await verifyAPI.verify({ hash: decodedHash });
        setScanResult(data);
        
        // Step 4: Anti-Spoofing / Tamper Check
        // Compare OCR text with Blockchain data
        if (data.status === "VALID") {
          const recipientNameLower = data.recipientName.toLowerCase();
          const issuerNameLower = data.issuerName.toLowerCase();
          const ocrLower = text.toLowerCase();
          
          if (!ocrLower.includes(recipientNameLower.split(" ")[0])) {
            setTamperWarning(`WARNING: The name '${data.recipientName}' from the cryptographic record was NOT found in the document text. This document may have been visually altered.`);
          } else if (!ocrLower.includes(issuerNameLower.split(" ")[0])) {
            setTamperWarning(`WARNING: The issuer '${data.issuerName}' from the cryptographic record was NOT found in the document text.`);
          }
        }
      } else {
        setScanError("No valid cryptographic QR code found in the image. Please upload an official ProofMind secured document.");
      }

    } catch (err: any) {
      setScanError(err.message || "Failed to process document");
    } finally {
      setScanLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- Plagiarism Check ---
  const handlePlagFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setPlagText(text);
    if (plagFileInputRef.current) plagFileInputRef.current.value = "";
  };

  const handlePlagiarismCheck = async () => {
    if (!plagText.trim() || plagText.length < 100) {
      alert("Please provide at least 100 characters of text for meaningful analysis.");
      return;
    }
    
    setPlagLoading(true);
    setPlagResult(null);
    try {
      const data = await plagiarismAPI.verify(plagText);
      setPlagResult(data);
    } catch (err: any) {
      alert(err.message || "Failed to run plagiarism check");
    } finally {
      setPlagLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 relative">
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />
      
      {/* Hidden div for html5-qrcode file scanning */}
      <div id="hidden-qr-reader" style={{ display: 'none' }}></div>

      {/* Header */}
      <header className="bg-parchment-100/90 backdrop-blur-md border-b border-parchment-200 sticky top-0 z-40">
        <div className="max-w-[90rem] mx-auto px-6 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <ShieldCheck className="w-6 h-6 text-bronze group-hover:rotate-12 transition-transform duration-500" />
              <span className="font-display font-black text-xl tracking-tight text-ink-900 uppercase hidden sm:block">
                Proof<span className="text-bronze">Mind</span>
              </span>
            </Link>
            <div className="h-6 w-px bg-parchment-300" />
            <div className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-ink-500" />
              <span className="font-bold text-xs uppercase tracking-widest text-ink-900">Verification Engine</span>
            </div>
          </div>
          <div>
            <Link href="/auth/login" className="text-[10px] font-bold uppercase tracking-widest text-ink-500 hover:text-bronze transition-colors border border-parchment-300 px-4 py-2 rounded-full hover:bg-parchment-200">
              Issuer Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase text-ink-900 mb-4">
            Verify <span className="text-bronze">Authenticity</span>
          </h1>
          <p className="text-ink-500 font-medium max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-widest">
            Cryptographically verify degrees, detect visual tampering via OCR, and run structural SimHash analysis to prevent academic fraud.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[
            { id: "hash", label: "Hash / Share ID", icon: Search },
            { id: "scan", label: "Upload & Verify", icon: UploadCloud },
            { id: "plagiarism", label: "Plagiarism Scanner", icon: Fingerprint }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${
                  isActive 
                  ? "bg-ink-900 text-parchment-100 shadow-md scale-105" 
                  : "bg-white text-ink-600 border border-parchment-200 hover:border-bronze hover:text-bronze"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="beanro-card max-w-2xl mx-auto mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-bronze/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            
            {/* TAB: HASH */}
            {activeTab === "hash" && (
              <motion.div key="hash" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="relative z-10">
                <form onSubmit={handleHashVerify} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    placeholder="Enter SHA-256 Hash or Share ID (0x...)"
                    className="input-field flex-1 text-sm font-mono placeholder:font-sans"
                    required
                  />
                  <button type="submit" disabled={hashLoading || !hash.trim()} className="btn-primary sm:w-auto w-full flex items-center justify-center gap-2">
                    {hashLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search className="w-4 h-4" /> Verify</>}
                  </button>
                </form>
                
                {hashError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-brand-revoked text-sm font-medium flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{hashError}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: SCAN & OCR */}
            {activeTab === "scan" && (
              <motion.div key="scan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="relative z-10 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-parchment-300 hover:border-bronze bg-parchment-50 hover:bg-white transition-colors rounded-xl p-12 cursor-pointer flex flex-col items-center justify-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-full bg-parchment-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {scanLoading ? (
                       <div className="w-8 h-8 border-2 border-bronze/30 border-t-bronze rounded-full animate-spin" />
                    ) : (
                      <UploadCloud className="w-8 h-8 text-ink-400 group-hover:text-bronze transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-ink-900 uppercase tracking-widest">Upload Certificate Image</p>
                    <p className="text-xs text-ink-500 font-medium mt-1">We'll scan the QR code and extract text to detect visual tampering.</p>
                  </div>
                </div>

                {scanError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-brand-revoked text-sm font-medium flex items-start gap-2 text-left">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{scanError}</p>
                  </div>
                )}

                {scanLoading && (
                  <div className="mt-6 text-xs font-bold uppercase tracking-widest text-ink-500 animate-pulse">
                    Running Optical Character Recognition & Cryptographic Decoding...
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB: PLAGIARISM */}
            {activeTab === "plagiarism" && (
              <motion.div key="plag" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-4 text-center">
                  Check a thesis against the global ProofMind network for unauthorized duplicates.
                </p>
                <textarea
                  value={plagText}
                  onChange={(e) => setPlagText(e.target.value)}
                  placeholder="Paste thesis or research text here (min 100 characters)..."
                  className="input-field w-full h-48 mb-4 text-sm resize-none"
                />
                <input
                  type="file"
                  accept=".txt"
                  onChange={handlePlagFileUpload}
                  ref={plagFileInputRef}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <button 
                    onClick={() => plagFileInputRef.current?.click()}
                    className="text-xs font-bold uppercase tracking-widest text-bronze hover:text-ink-900 transition-colors flex items-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload .txt File instead
                  </button>
                  <button 
                    onClick={handlePlagiarismCheck}
                    disabled={plagLoading || plagText.length < 100} 
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {plagLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Activity className="w-4 h-4" /> Run SimHash Scanner</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Verification Result Output (Hash & Scan) */}
        {(activeTab === "hash" ? hashResult : activeTab === "scan" ? scanResult : null) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="beanro-card max-w-2xl mx-auto mb-12">
            
            {/* Tamper Warning Banner */}
            {tamperWarning && (
              <div className="mb-8 p-6 bg-red-50 border-2 border-red-500 rounded-xl text-brand-revoked text-sm font-bold flex items-start gap-4">
                <AlertCircle className="w-8 h-8 flex-shrink-0 animate-pulse" />
                <div>
                  <h3 className="text-lg uppercase tracking-widest mb-1">Visual Tampering Detected</h3>
                  <p className="font-medium">{tamperWarning}</p>
                </div>
              </div>
            )}

            <div className="text-center mb-10 pb-10 border-b border-parchment-200">
              {(activeTab === "hash" ? hashResult : scanResult).status === "VALID" ? (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6 border border-emerald-200 shadow-sm relative">
                  <div className="absolute inset-0 bg-brand-valid/10 rounded-full animate-ping" />
                  <CheckCircle2 className="w-10 h-10 text-brand-valid relative z-10" />
                </div>
              ) : (
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6 border border-red-200 shadow-sm">
                  <XCircle className="w-10 h-10 text-brand-revoked" />
                </div>
              )}
              
              <h2 className="font-display font-black text-3xl uppercase text-ink-900 mb-2">
                {(activeTab === "hash" ? hashResult : scanResult).status === "VALID" ? "Authentic Credential" : "Invalid / Revoked"}
              </h2>
              <p className="text-ink-500 font-medium text-xs uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                {(activeTab === "hash" ? hashResult : scanResult).status === "VALID" 
                  ? "This record has been explicitly verified against the immutable Polygon blockchain."
                  : "This record could not be verified or has been explicitly revoked by the issuer."}
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Recipient Name</p>
                  <p className="font-bold text-ink-900 text-lg">{(activeTab === "hash" ? hashResult : scanResult).recipientName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Credential Title</p>
                  <p className="font-bold text-ink-900 text-lg">{(activeTab === "hash" ? hashResult : scanResult).title}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Issuing Institution</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-bronze" />
                    <p className="font-bold text-ink-900">{(activeTab === "hash" ? hashResult : scanResult).issuerName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="font-bold text-ink-900">{new Date((activeTab === "hash" ? hashResult : scanResult).issueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-parchment-200">
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">Cryptographic Hash</p>
                <div className="bg-parchment-50 p-3 rounded-xl border border-parchment-200 overflow-x-auto">
                  <code className="text-xs font-mono text-ink-600 break-all">
                    {(activeTab === "hash" ? hashResult : scanResult).credentialHash}
                  </code>
                </div>
              </div>

              {ocrText && (
                <div className="pt-6 border-t border-parchment-200">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">Extracted Document Text (OCR)</p>
                  <div className="bg-white p-4 rounded-xl border border-parchment-200 h-32 overflow-y-auto">
                    <p className="text-xs font-mono text-ink-600 whitespace-pre-wrap">{ocrText}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Plagiarism Result Output */}
        {activeTab === "plagiarism" && plagResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="beanro-card max-w-2xl mx-auto mb-12">
            <div className={`p-6 border-b border-parchment-200 rounded-t-xl ${plagResult.riskLevel === "HIGH" ? "bg-red-50" : plagResult.riskLevel === "MEDIUM" ? "bg-yellow-50" : "bg-emerald-50"}`}>
              <div className="flex items-center gap-3 mb-2">
                {plagResult.riskLevel === "HIGH" ? <AlertCircle className="w-8 h-8 text-brand-revoked" /> : 
                 plagResult.riskLevel === "MEDIUM" ? <AlertCircle className="w-8 h-8 text-yellow-600" /> : 
                 <CheckCircle2 className="w-8 h-8 text-brand-valid" />}
                <h3 className="font-display font-black text-2xl uppercase text-ink-900">
                  {plagResult.riskLevel === "HIGH" ? "High Risk of Plagiarism" : 
                   plagResult.riskLevel === "MEDIUM" ? "Moderate Similarity" : 
                   "No Significant Duplication"}
                </h3>
              </div>
              <p className="text-sm font-bold text-ink-700">{plagResult.verdict}</p>
            </div>
            
            <div className="p-6">
              <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-4">Top Matches in Registry</h4>
              {plagResult.matches.length > 0 ? (
                <div className="space-y-4">
                  {plagResult.matches.map((match: any) => (
                    <div key={match.id} className="bg-parchment-50 p-4 rounded-xl border border-parchment-200 flex justify-between items-center gap-4">
                      <div>
                        <p className="font-bold text-ink-900 text-sm">{match.title}</p>
                        <p className="text-xs text-ink-500 font-medium">by {match.authorName}</p>
                      </div>
                      <div className={`text-xl font-display font-black ${match.similarity >= 85 ? 'text-brand-revoked' : 'text-yellow-600'}`}>
                        {match.similarity.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-ink-500 italic">No matches found.</p>
              )}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-parchment-300 border-t-bronze rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
