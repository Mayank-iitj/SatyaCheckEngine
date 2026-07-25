"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { verifyAPI, plagiarismAPI } from "@/lib/api";
import { Search, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Scan, Building2, FileText, QrCode, UploadCloud, Fingerprint, Activity, Beaker } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import Tesseract from "tesseract.js";

// --- MOCK DATA FOR DEMO SIMULATIONS ---
const DEMO_SIMULATIONS: Record<string, any> = {
  "0xvalid_degree": {
    status: "VALID",
    recipientName: "Alice Smith",
    title: "B.Tech Computer Science",
    issuerName: "IIT Bombay",
    issueDate: "2023-05-15T00:00:00.000Z",
    credentialHash: "0xvalid_degree_8921abcdef1234567890abcdef"
  },
  "0xvalid_diploma": {
    status: "VALID",
    recipientName: "Bob Johnson",
    title: "High School Diploma",
    issuerName: "CBSE Board",
    issueDate: "2019-06-10T00:00:00.000Z",
    credentialHash: "0xvalid_diploma_4412fedcba0987654321fedcba"
  },
  "0xrevoked_fraud": {
    status: "REVOKED",
    recipientName: "Charlie Brown",
    title: "Master of Business",
    issuerName: "Delhi University",
    issueDate: "2021-08-20T00:00:00.000Z",
    credentialHash: "0xrevoked_fraud_9999abcdef1234567890abcdef"
  },
  "0xfake_not_found": null, // Triggers an error
};

function VerifyContent() {
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<"hash" | "scan" | "plagiarism">("hash");
  
  // Hash Tab State
  const [hash, setHash] = useState("");
  const [hashLoading, setHashLoading] = useState(false);
  const [hashError, setHashError] = useState<string | null>(null);
  const [hashResult, setHashResult] = useState<any | null>(null);
  const [simulationStep, setSimulationStep] = useState(0);
  
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
  const autoVerify = async (hashToVerify: string, isTamperSimulation: boolean = false) => {
    setHashLoading(true);
    setHashError(null);
    setHashResult(null);
    setTamperWarning(null);
    setSimulationStep(1);

    // Simulate blockchain node traversal workflow
    setTimeout(() => setSimulationStep(2), 1000); // Querying Polygon nodes...
    setTimeout(() => setSimulationStep(3), 2000); // Verifying Cryptographic Signatures...
    
    setTimeout(async () => {
      try {
        // Check if it's a demo simulation hash
        if (DEMO_SIMULATIONS.hasOwnProperty(hashToVerify)) {
          const demoData = DEMO_SIMULATIONS[hashToVerify];
          if (demoData === null) {
            throw new Error("Invalid or unrecorded cryptographic hash. No record found on blockchain.");
          }
          setHashResult(demoData);
        } else if (isTamperSimulation) {
          // Tampered simulation: Valid hash, but OCR mismatch injected
          setHashResult(DEMO_SIMULATIONS["0xvalid_degree"]);
          setTamperWarning("WARNING: The name 'Alice Smith' from the cryptographic record was NOT found in the document text. This document may have been visually altered.");
        } else {
          // Real API call if not a demo hash
          const data = await verifyAPI.verify({ hash: hashToVerify });
          setHashResult(data);
        }
      } catch (err: any) {
        setHashError(err.message || "Verification request failed");
      } finally {
        setHashLoading(false);
        setSimulationStep(0);
      }
    }, 3000);
  };

  const handleHashVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    autoVerify(hash.trim());
  };

  // Quick Demo Triggers
  const triggerSimulation = (hashVal: string, isTampered: boolean = false) => {
    setActiveTab("hash");
    setHash(hashVal);
    autoVerify(hashVal, isTampered);
  };

  // --- Scan / Upload Verification ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processFile = async (file: File) => {
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    setOcrText("");
    setTamperWarning(null);
    setSimulationStep(1); // Set an initial loading step

    try {
      // Small timeout to allow UI to render loading state
      await new Promise(r => setTimeout(r, 500));

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

      setSimulationStep(2); // OCR phase
      
      // Step 2: Run OCR on the image
      const tesseractResult = await Tesseract.recognize(file, 'eng');
      const text = tesseractResult.data.text;
      setOcrText(text);

      setSimulationStep(3); // Verify Phase

      // For our simulated demo files, inject some mock logic if QR decoding fails (since AI generated QRs aren't real scannable QRs)
      const fileName = file.name.toLowerCase();
      let forceSimulatedHash = "";
      let isTamperSimulation = false;
      
      if (!decodedHash) {
        if (fileName.includes("valid_degree")) forceSimulatedHash = "0xvalid_degree";
        else if (fileName.includes("valid_diploma")) forceSimulatedHash = "0xvalid_diploma";
        else if (fileName.includes("revoked")) forceSimulatedHash = "0xrevoked_fraud";
        else if (fileName.includes("fake")) forceSimulatedHash = "0xfake_not_found";
        else if (fileName.includes("tampered")) {
          forceSimulatedHash = "0xvalid_degree";
          isTamperSimulation = true;
        }
      }

      const hashToVerify = decodedHash || forceSimulatedHash;

      // Step 3: Verify if we got a hash from QR or Simulation
      if (hashToVerify) {
        let data;
        
        // Check if it's a demo simulation hash
        if (DEMO_SIMULATIONS.hasOwnProperty(hashToVerify)) {
          if (DEMO_SIMULATIONS[hashToVerify] === null) {
            throw new Error("Invalid or unrecorded cryptographic hash. No record found on blockchain.");
          }
          data = DEMO_SIMULATIONS[hashToVerify];
          setScanResult(data);
        } else {
           data = await verifyAPI.verify({ hash: hashToVerify });
           setScanResult(data);
        }
        
        // Step 4: Anti-Spoofing / Tamper Check
        // Compare OCR text with Blockchain data
        if (data.status === "VALID") {
          const recipientNameLower = data.recipientName.toLowerCase();
          const issuerNameLower = data.issuerName.toLowerCase();
          const ocrLower = text.toLowerCase();
          
          if (isTamperSimulation || (!ocrLower.includes(recipientNameLower.split(" ")[0]) && text.length > 50)) {
            setTamperWarning(`WARNING: The name '${data.recipientName}' from the cryptographic record was NOT found in the document text. This document may have been visually altered.`);
          } else if (!isTamperSimulation && !ocrLower.includes(issuerNameLower.split(" ")[0]) && text.length > 50) {
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
      setSimulationStep(0);
    }
  };

  const triggerImageSimulation = async (filename: string) => {
    setActiveTab("scan");
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    setSimulationStep(1); // Fetching image
    
    try {
      const response = await fetch(`/demo/${filename}`);
      if (!response.ok) throw new Error("Could not load demo image. Ensure it exists in public/demo.");
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });
      await processFile(file);
    } catch (err: any) {
      setScanError(err.message);
      setScanLoading(false);
      setSimulationStep(0);
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

  const triggerPlagiarismSimulation = (simKey: string) => {
    setActiveTab("plagiarism");
    
    // Set a placeholder text that looks like a real thesis excerpt
    if (simKey === "original_work") {
      setPlagText("This thesis introduces a novel framework for decentralized consensus mechanisms. By utilizing a hybrid approach combining Proof of Work and Proof of Stake, we address the Byzantine Generals Problem in asynchronous networks with high latency. The experimental results demonstrate a 40% reduction in energy consumption while maintaining robust security properties against 51% attacks.");
    } else if (simKey === "partial_match") {
      setPlagText("The global economy in 2020 experienced unprecedented shifts due to supply chain disruptions. In this paper, we analyze the macroeconomic impact of these disruptions on emerging markets. Our methodology relies on cross-sectional regression models evaluating GDP growth rates versus supply chain dependency indices across 50 nations. The findings suggest a moderate correlation between dependency and economic contraction.");
    } else {
      setPlagText("Machine learning applications in finance have grown exponentially. This research explores the use of predictive models for stock price forecasting. We implement Long Short-Term Memory (LSTM) networks to analyze historical time-series data. The neural network architecture consists of three hidden layers with dropout regularization to prevent overfitting. Our results show a high degree of predictive accuracy on the S&P 500 dataset.");
    }

    runPlagiarismCheck(simKey);
  };

  const runPlagiarismCheck = async (simKey?: string) => {
    if (!plagText.trim() || plagText.length < 100) {
      alert("Please provide at least 100 characters of text for meaningful analysis.");
      return;
    }
    
    setPlagLoading(true);
    setPlagResult(null);
    setSimulationStep(1);

    setTimeout(() => setSimulationStep(2), 1500); // Hashing local text...
    setTimeout(() => setSimulationStep(3), 3000); // Cross-referencing Global Registry...
    
    setTimeout(async () => {
      try {
        if (simKey && PLAGIARISM_SIMULATIONS[simKey]) {
          setPlagResult(PLAGIARISM_SIMULATIONS[simKey]);
        } else {
          const data = await plagiarismAPI.verify(plagText);
          setPlagResult(data);
        }
      } catch (err: any) {
        alert(err.message || "Failed to run plagiarism check");
      } finally {
        setPlagLoading(false);
        setSimulationStep(0);
      }
    }, 4500);
  };

  const handlePlagiarismCheck = async () => {
    runPlagiarismCheck();
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
              <img src="/logo.svg" alt="ProofMind Logo" className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
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
            <Link href="/sign-in" className="text-[10px] font-bold uppercase tracking-widest text-ink-500 hover:text-bronze transition-colors border border-parchment-300 px-4 py-2 rounded-full hover:bg-parchment-200">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase text-ink-900 mb-4">
            Verify <span className="text-bronze">Authenticity</span>
          </h1>
          <p className="text-ink-500 font-medium max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-widest">
            Cryptographically verify degrees, detect visual tampering via OCR, and run structural SimHash analysis to prevent academic fraud.
          </p>
        </div>

        {/* --- DEMO SIMULATION QUICK PANEL --- */}
        <div className="mb-12 bg-white/60 p-4 rounded-xl border border-bronze/30 backdrop-blur-sm max-w-3xl mx-auto flex flex-col items-center shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-bronze">
            <Beaker className="w-4 h-4" /> Quick Demo Simulations
          </div>
          
          {activeTab === "plagiarism" ? (
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => triggerPlagiarismSimulation("original_work")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200">
                1. Original Work
              </button>
              <button onClick={() => triggerPlagiarismSimulation("partial_match")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-200">
                2. Partial Match (55%)
              </button>
              <button onClick={() => triggerPlagiarismSimulation("high_plagiarism")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-200">
                3. High Plagiarism (92%)
              </button>
            </div>
          ) : activeTab === "scan" ? (
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => triggerImageSimulation("demo_cert_valid_degree_1784975309293.png")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200">
                1. Valid Degree Image
              </button>
              <button onClick={() => triggerImageSimulation("demo_cert_valid_diploma_1784975328164.png")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200">
                2. Valid Diploma Image
              </button>
              <button onClick={() => triggerImageSimulation("demo_cert_revoked_1784975339186.png")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-200">
                3. Revoked Degree Image
              </button>
              <button onClick={() => triggerImageSimulation("demo_cert_fake_1784975350069.png")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200">
                4. Fake Image
              </button>
              <button onClick={() => triggerImageSimulation("demo_cert_tampered_1784975360559.png")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-200">
                5. Tampered Image (Eve)
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => triggerSimulation("0xvalid_degree")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200">
                1. Valid Degree
              </button>
              <button onClick={() => triggerSimulation("0xvalid_diploma")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200">
                2. Valid Diploma
              </button>
              <button onClick={() => triggerSimulation("0xrevoked_fraud")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors border border-red-200">
                3. Revoked (Fraud)
              </button>
              <button onClick={() => triggerSimulation("0xfake_not_found")} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200">
                4. Fake (Not Found)
              </button>
              <button onClick={() => triggerSimulation("0xtampered_ocr", true)} className="px-3 py-1.5 text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors border border-yellow-200">
                5. Visual Tamper (OCR mismatch)
              </button>
            </div>
          )}
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

                {hashLoading && (
                  <div className="mt-8 flex flex-col items-center justify-center text-center">
                    <h3 className="font-display font-bold text-lg text-ink-900 mb-4 uppercase">
                      {simulationStep === 1 && "Connecting to Network..."}
                      {simulationStep === 2 && "Querying Polygon Blockchain Nodes..."}
                      {simulationStep === 3 && "Verifying Cryptographic Signatures..."}
                    </h3>
                    <div className="w-full max-w-sm h-1.5 bg-parchment-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-bronze"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(simulationStep / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
                
                {hashError && !hashLoading && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl text-brand-revoked text-sm font-medium flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-widest text-[10px] mb-1">Verification Failed</p>
                      <p>{hashError}</p>
                    </div>
                  </motion.div>
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
                  <div className="mt-8 flex flex-col items-center justify-center text-center">
                    <h3 className="font-display font-bold text-lg text-ink-900 mb-4 uppercase">
                      {simulationStep === 1 && "Fetching & Loading Image..."}
                      {simulationStep === 2 && "Running Tesseract OCR Engine..."}
                      {simulationStep === 3 && "Extracting Cryptographic Data..."}
                    </h3>
                    <div className="w-full max-w-sm h-1.5 bg-parchment-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-bronze"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(simulationStep / 3) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
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
                  disabled={plagLoading}
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
                    disabled={plagLoading}
                    className="text-xs font-bold uppercase tracking-widest text-bronze hover:text-ink-900 transition-colors flex items-center gap-2 disabled:opacity-50"
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

                {plagLoading && (
                  <div className="mt-8 flex flex-col items-center justify-center text-center">
                    <h3 className="font-display font-bold text-lg text-ink-900 mb-4 uppercase">
                      {simulationStep === 1 && "Generating SimHash Fingerprint..."}
                      {simulationStep === 2 && "Cross-referencing Global Registry..."}
                    </h3>
                    <div className="w-full max-w-sm h-1.5 bg-parchment-200 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(simulationStep / 2) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Verification Result Output (Hash & Scan) */}
        {(activeTab === "hash" ? hashResult : activeTab === "scan" ? scanResult : null) && !hashLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="beanro-card max-w-2xl mx-auto mb-12 border-bronze/30 shadow-lg">
            
            {/* Tamper Warning Banner */}
            {tamperWarning && (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8 p-6 bg-red-50 border-2 border-red-500 rounded-xl text-brand-revoked text-sm font-bold flex items-start gap-4 shadow-sm">
                <AlertCircle className="w-8 h-8 flex-shrink-0 animate-pulse" />
                <div>
                  <h3 className="text-lg uppercase tracking-widest mb-1">Visual Tampering Detected</h3>
                  <p className="font-medium">{tamperWarning}</p>
                </div>
              </motion.div>
            )}

            <div className="text-center mb-10 pb-10 border-b border-parchment-200">
              {(activeTab === "hash" ? hashResult : scanResult).status === "VALID" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", stiffness: 200 }} className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 rounded-full mb-6 border-2 border-emerald-300 shadow-sm relative">
                  <div className="absolute inset-0 bg-brand-valid/20 rounded-full animate-ping" />
                  <CheckCircle2 className="w-12 h-12 text-brand-valid relative z-10" />
                </motion.div>
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ type: "spring", stiffness: 200 }} className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6 border-2 border-red-300 shadow-sm relative">
                  <div className="absolute inset-0 bg-brand-revoked/20 rounded-full animate-ping" />
                  <XCircle className="w-12 h-12 text-brand-revoked relative z-10" />
                </motion.div>
              )}
              
              <h2 className="font-display font-black text-4xl uppercase text-ink-900 mb-3">
                {(activeTab === "hash" ? hashResult : scanResult).status === "VALID" ? "Authentic Credential" : "Invalid / Revoked"}
              </h2>
              <p className="text-ink-600 font-bold text-xs uppercase tracking-widest leading-relaxed max-w-md mx-auto bg-parchment-50 py-2 rounded-lg border border-parchment-200">
                {(activeTab === "hash" ? hashResult : scanResult).status === "VALID" 
                  ? "Record mathematically verified via Polygon Blockchain"
                  : "Record explicitly revoked or compromised"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-parchment-200">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Recipient Name</p>
                  <p className="font-bold text-ink-900 text-lg">{(activeTab === "hash" ? hashResult : scanResult).recipientName}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-parchment-200">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Credential Title</p>
                  <p className="font-bold text-ink-900 text-lg">{(activeTab === "hash" ? hashResult : scanResult).title}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-parchment-200">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Issuing Institution</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-bronze" />
                    <p className="font-bold text-ink-900 text-lg">{(activeTab === "hash" ? hashResult : scanResult).issuerName}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-parchment-200">
                  <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">Issue Date</p>
                  <p className="font-bold text-ink-900 text-lg">{new Date((activeTab === "hash" ? hashResult : scanResult).issueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-parchment-200">
                <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-bronze" /> Cryptographic Hash Proof
                </p>
                <div className="bg-parchment-100 p-4 rounded-xl border border-bronze/20 overflow-x-auto shadow-inner">
                  <code className="text-sm font-black font-mono text-ink-700 break-all">
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
        {activeTab === "plagiarism" && plagResult && !plagLoading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="beanro-card max-w-2xl mx-auto mb-12 p-0 overflow-hidden shadow-lg border-bronze/30">
            <div className={`p-8 border-b border-parchment-200 ${plagResult.riskLevel === "HIGH" ? "bg-red-50" : plagResult.riskLevel === "MEDIUM" ? "bg-yellow-50" : "bg-emerald-50"}`}>
              <div className="flex items-center gap-4 mb-3">
                {plagResult.riskLevel === "HIGH" ? <AlertCircle className="w-10 h-10 text-brand-revoked" /> : 
                 plagResult.riskLevel === "MEDIUM" ? <AlertCircle className="w-10 h-10 text-yellow-600" /> : 
                 <CheckCircle2 className="w-10 h-10 text-brand-valid" />}
                <h3 className="font-display font-black text-3xl uppercase text-ink-900">
                  {plagResult.riskLevel === "HIGH" ? "High Risk of Plagiarism" : 
                   plagResult.riskLevel === "MEDIUM" ? "Moderate Similarity" : 
                   "No Significant Duplication"}
                </h3>
              </div>
              <p className="text-sm font-bold text-ink-700 bg-white/50 inline-block px-4 py-2 rounded-lg">{plagResult.verdict}</p>
            </div>
            
            <div className="p-8">
              <h4 className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-bronze" /> Top Matches in Global Registry
              </h4>
              {plagResult.matches.length > 0 ? (
                <div className="space-y-4">
                  {plagResult.matches.map((match: any, i: number) => (
                    <motion.div 
                      key={match.id} 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white hover:bg-parchment-50 transition-colors p-5 rounded-2xl border border-parchment-200 flex justify-between items-center gap-4 shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-ink-900 text-lg mb-1">{match.title}</p>
                        <p className="text-xs text-ink-500 font-bold uppercase tracking-widest">by {match.authorName}</p>
                      </div>
                      <div className={`text-2xl font-display font-black px-4 py-2 rounded-xl ${match.similarity >= 85 ? 'bg-red-100 text-brand-revoked' : 'bg-yellow-100 text-yellow-700'}`}>
                        {match.similarity.toFixed(1)}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-parchment-50 rounded-2xl border border-parchment-200 border-dashed">
                  <CheckCircle2 className="w-12 h-12 text-brand-valid/50 mx-auto mb-3" />
                  <p className="text-sm font-bold uppercase tracking-widest text-ink-500">No cryptographic matches found.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
}

const PLAGIARISM_SIMULATIONS: Record<string, any> = {
  "original_work": {
    status: "ANALYZED",
    verdict: "This document appears original.",
    riskLevel: "LOW",
    matches: []
  },
  "partial_match": {
    status: "ANALYZED",
    verdict: "Moderate structural similarity detected.",
    riskLevel: "MEDIUM",
    matches: [
      { id: "p1", title: "Global Economy Analysis 2020", authorName: "Dr. Adam Smith", similarity: 55.4 }
    ]
  },
  "high_plagiarism": {
    status: "ANALYZED",
    verdict: "High risk of plagiarism. Exact structural copies found.",
    riskLevel: "HIGH",
    matches: [
      { id: "p2", title: "Machine Learning in Finance", authorName: "Jane Doe", similarity: 92.1 },
      { id: "p3", title: "Predictive Models for Stocks", authorName: "John Roe", similarity: 88.5 }
    ]
  }
};

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
