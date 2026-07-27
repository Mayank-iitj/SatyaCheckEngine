"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ShieldCheck, UploadCloud, Lock, FileKey } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { featuresAPI } from "@/lib/api";

export default function WhistleblowerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [status, setStatus] = useState<"idle" | "generating" | "submitting" | "success">("idle");
  const [proofHash, setProofHash] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    featuresAPI.getWhistleblower()
      .then(data => setReports(data.reports || []))
      .catch(console.error);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !companyName) return;

    setStatus("generating");

    // Animate terminal
    if (codeRef.current) {
      gsap.to(codeRef.current, { height: "auto", opacity: 1, duration: 0.5 });
    }

    // Mock ZK-SNARK generation delay
    setTimeout(async () => {
      const mockHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("");
      setProofHash(mockHash);
      setStatus("submitting");

      try {
        await featuresAPI.submitWhistleblower({
          zkProofHash: mockHash,
          companyName,
          reportData: "ENCRYPTED_PAYLOAD_" + file.name
        });
        setStatus("success");
        if (cardRef.current) {
          gsap.fromTo(cardRef.current, { scale: 1 }, { scale: 1.05, yoyo: true, repeat: 1, duration: 0.3, ease: "power2.out" });
        }
      } catch (err) {
        console.error(err);
        setStatus("idle");
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        <Link href="/" className="inline-flex items-center text-emerald-500 hover:text-emerald-400 mb-8 transition">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Zero-Knowledge Drop</h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Submit corporate fraud evidence with mathematical anonymity. We use ZK-SNARKs to prove you are an authenticated insider without ever revealing your identity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div ref={cardRef} className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <Lock className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Evidence Secured</h3>
                <p className="text-neutral-400 mb-6">Your report has been anonymously submitted to SEBI.</p>
                <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 w-full text-left font-mono text-xs text-emerald-500 break-all">
                  Proof: {proofHash}
                </div>
                <button onClick={() => setStatus("idle")} className="mt-8 px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition">
                  Submit Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Target Entity (Company)</label>
                  <input 
                    required
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                    placeholder="e.g. Acme Corp"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Evidence Document (PDF/Zip)</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-emerald-500/50 hover:bg-neutral-800/50 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 text-neutral-400 mb-2" />
                      <p className="text-sm text-neutral-400">
                        {file ? <span className="text-emerald-400 font-medium">{file.name}</span> : "Click to upload or drag and drop"}
                      </p>
                    </div>
                    <input required type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <button 
                  disabled={status !== "idle" || !file || !companyName}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "idle" ? (
                    <>
                      <FileKey className="w-4 h-4 mr-2" />
                      Generate ZK Proof & Submit
                    </>
                  ) : "Processing Cryptography..."}
                </button>
              </form>
            )}
          </div>

          {/* Terminal / Explanation */}
          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-emerald-400" /> How it works
              </h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>1. Your browser generates a cryptographic proof locally.</li>
                <li>2. The proof verifies you hold a valid corporate identity credential.</li>
                <li>3. The file is encrypted before leaving your device.</li>
                <li>4. SatyaCheck servers receive only the proof and encrypted payload, guaranteeing zero knowledge of your identity.</li>
              </ul>
            </div>

            <div 
              ref={codeRef} 
              className="bg-black border border-neutral-800 rounded-2xl p-6 font-mono text-xs opacity-0 h-0 overflow-hidden"
            >
              <div className="flex items-center mb-4 space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-neutral-500 ml-2">zk-terminal</span>
              </div>
              <div className="text-emerald-500 space-y-1">
                <p>&gt; Initializing SNARK circuit...</p>
                {status !== "idle" && <p className="animate-pulse">&gt; Proving identity statement...</p>}
                {status === "submitting" && <p>&gt; Proof generated: {proofHash.substring(0,20)}...</p>}
                {status === "success" && <p>&gt; Validated on-chain. Payload sealed.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Drops List */}
        <div className="mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-6 text-emerald-400">Recent Anonymous Drops</h3>
          <div className="space-y-4">
            {reports.map((report, idx) => (
              <div key={idx} className="bg-black border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{report.companyName}</h4>
                  <div className="text-xs text-neutral-500 font-mono mt-1 break-all">ZKP Hash: {report.zkProofHash}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-neutral-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    report.status === 'INVESTIGATING' ? 'bg-amber-500/20 text-amber-400' :
                    report.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-neutral-800 text-neutral-300'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
            {reports.length === 0 && <div className="text-neutral-500 text-sm">Loading recent drops...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
