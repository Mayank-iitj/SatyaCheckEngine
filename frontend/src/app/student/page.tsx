"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Wallet, LogOut, FileCheck, Share2, Target, Briefcase, Award, RotateCcw,
  CheckCircle2, XCircle, Copy, Check, Download, QrCode, Building2, Sparkles, BrainCircuit, RefreshCw, Layers
} from "lucide-react";
import { credentialsAPI, shareAPI, skillsAPI, jobsAPI, recoveryAPI, digilockerAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, getCredentialTypeLabel, truncateHash } from "@/lib/utils";
import { toast } from "sonner";
import { DigiLockerBadge } from "@/components/DigiLockerBadge";
import { UserButton } from "@clerk/nextjs";
import { QRCodeSVG } from "qrcode.react";

// --- MOCK DATA ---
const MOCK_CREDENTIALS = [
  {
    id: "mock-1",
    credentialId: "digi-cred-8921",
    title: "B.Tech in Computer Science",
    credentialType: "DEGREE",
    status: "VALID",
    issueDate: "2023-05-15T00:00:00.000Z",
    source: "DIGILOCKER_VERIFIED",
    issuer: { name: "IIT Bombay" },
    credentialHash: "0x39a17e36ba4a6b4d238ff944bacb478cbed5efca",
  },
  {
    id: "mock-2",
    credentialId: "digi-cred-4412",
    title: "Senior Secondary (Class XII)",
    credentialType: "DIPLOMA",
    status: "VALID",
    issueDate: "2019-05-10T00:00:00.000Z",
    source: "DIGILOCKER_VERIFIED",
    issuer: { name: "CBSE Board" },
    credentialHash: "0x8ff944bacb478cbed5efca39a17e36ba4a6b4d23",
  }
];

const MOCK_SKILLS = {
  totalScore: 94.2,
  title: "Full Stack Blockchain Engineer",
  bio: "Verified credentials spanning advanced computer science and decentralized systems.",
  entries: [
    { id: "sk-1", skillTag: "Computer Science", weight: 4.0, credential: { title: "B.Tech in Computer Science" } },
    { id: "sk-2", skillTag: "Mathematics", weight: 3.5, credential: { title: "Senior Secondary (Class XII)" } },
    { id: "sk-3", skillTag: "Decentralized Systems", weight: 2.0, credential: { title: "Web3 Bootcamp" } },
  ]
};

const MOCK_JOBS = [
  {
    id: "job-1",
    title: "Blockchain Protocol Engineer",
    company: "Web3Corp",
    location: "Remote / Global",
    salaryRange: "$140k - $180k",
    matchScore: 96,
    matchReasons: ["Credential types match: DEGREE", "Skills match: blockchain, computer science"]
  },
  {
    id: "job-2",
    title: "Senior Full Stack Developer",
    company: "Fintech Innovations",
    location: "London, UK",
    salaryRange: "£90k - £120k",
    matchScore: 89,
    matchReasons: ["Institution reputation meets threshold", "Skills match: full stack, mathematics"]
  }
];

const MOCK_RECOVERY = [
  {
    id: "rec-1",
    originalTitle: "B.S. Information Technology",
    status: "APPROVED",
    evidenceNotes: "University records destroyed in flood. Verified via secondary alumni database."
  },
  {
    id: "rec-2",
    originalTitle: "Master of Data Science",
    status: "PENDING",
    evidenceNotes: "Broadcasting to institution nodes..."
  }
];

export default function StudentDashboard() {
  const router = useRouter();
  const { user, clearAuth, isLoaded } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"credentials" | "skills" | "jobs" | "recovery">("credentials");

  // Credentials State
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [activeShareLink, setActiveShareLink] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // DigiLocker Simulation State
  const [isSimulatingDigilocker, setIsSimulatingDigilocker] = useState(false);
  const [digilockerStep, setDigilockerStep] = useState(0);

  // Skill Profile State
  const [skillProfile, setSkillProfile] = useState<any>(null);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [isSimulatingSkills, setIsSimulatingSkills] = useState(false);
  const [skillsStep, setSkillsStep] = useState(0);

  // Job Matches State
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [isSimulatingJobs, setIsSimulatingJobs] = useState(false);
  const [jobsStep, setJobsStep] = useState(0);

  // Recovery State
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [isSimulatingRecovery, setIsSimulatingRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(0);
  const [recoveryForm, setRecoveryForm] = useState({ institutionId: "", originalTitle: "", evidenceNotes: "" });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (user.role !== "STUDENT") {
      router.push("/dashboard");
      return;
    }
    
    if (activeTab === "credentials") loadCredentials();
    if (activeTab === "skills") loadSkills();
    if (activeTab === "jobs") loadJobs();
    if (activeTab === "recovery") loadRecovery();
  }, [user, isLoaded, router, activeTab]);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const data = await credentialsAPI.mine();
      setCredentials(data);
    } catch (err) {
      console.error("Failed to load credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- SIMULATED WORKFLOWS ---

  const handleDigilockerConnect = async () => {
    setIsSimulatingDigilocker(true);
    setDigilockerStep(1);
    
    setTimeout(() => setDigilockerStep(2), 1200); // Verifying Aadhaar KYC...
    setTimeout(() => setDigilockerStep(3), 2400); // Fetching Academic Records...
    setTimeout(() => setDigilockerStep(4), 3600); // Converting to OCR Proof Immutable Record...
    setTimeout(() => setDigilockerStep(5), 4800); // Generating Unique Cryptographic QR Code...
    setTimeout(() => setDigilockerStep(6), 6000); // Cryptographically Sealing on Blockchain...
    setTimeout(() => {
      setCredentials(MOCK_CREDENTIALS);
      setIsSimulatingDigilocker(false);
      setDigilockerStep(0);
      toast.success("Successfully generated OCR-Proof Immutable Records with Unique QR codes!");
    }, 7200);
  };

  const handleInitializeProfile = () => {
    setIsSimulatingSkills(true);
    setSkillsStep(1);

    setTimeout(() => setSkillsStep(2), 1500); // Analyzing micro-credentials...
    setTimeout(() => setSkillsStep(3), 3000); // Stacking skill weights...
    setTimeout(() => setSkillsStep(4), 4500); // Calculating global percentile...
    setTimeout(() => {
      setSkillProfile(MOCK_SKILLS);
      setIsSimulatingSkills(false);
      setSkillsStep(0);
      toast.success("Dynamic Skill Profile successfully stacked!");
    }, 6000);
  };

  const handleRunAIMatch = () => {
    setIsSimulatingJobs(true);
    setJobsStep(1);

    setTimeout(() => setJobsStep(2), 1500); // Reading verified credentials...
    setTimeout(() => setJobsStep(3), 3000); // Querying global job market...
    setTimeout(() => setJobsStep(4), 4500); // Running LLM suitability analysis...
    setTimeout(() => {
      setJobMatches(MOCK_JOBS);
      setIsSimulatingJobs(false);
      setJobsStep(0);
      toast.success("AI has found perfect career matches based on your verified credentials!");
    }, 6000);
  };

  const handleSimulatedRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulatingRecovery(true);
    setRecoveryStep(1);

    setTimeout(() => setRecoveryStep(2), 1500); // Encoding evidence notes...
    setTimeout(() => setRecoveryStep(3), 3000); // Broadcasting to Institution Node...
    setTimeout(() => {
      setRecoveryRequests([{
        id: `rec-${Math.random()}`,
        originalTitle: recoveryForm.originalTitle || "Unknown Degree",
        status: "PENDING",
        evidenceNotes: recoveryForm.evidenceNotes
      }, ...MOCK_RECOVERY]);
      setRecoveryForm({ institutionId: "", originalTitle: "", evidenceNotes: "" });
      setIsSimulatingRecovery(false);
      setRecoveryStep(0);
      toast.success("Recovery request broadcasted successfully to the decentralized network.");
    }, 4500);
  };

  const loadSkills = async () => {
    setLoadingSkills(true);
    try {
      const data = await skillsAPI.getProfile(user!.id);
      setSkillProfile(data);
    } catch (err) {
      console.log("Skill profile not found, that's okay.");
    } finally {
      setLoadingSkills(false);
    }
  };

  const loadJobs = async () => {
    setLoadingJobs(true);
    try {
      // If we don't have job matches yet, we just render the button to trigger AI.
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadRecovery = async () => {
    setLoadingRecovery(true);
    try {
      const data = await recoveryAPI.mine();
      // Only set real data if there is some, otherwise show the mock list to demonstrate the UI
      if (data && data.length > 0) {
        setRecoveryRequests(data);
      } else {
        setRecoveryRequests(MOCK_RECOVERY);
      }
    } catch (err) {
      // Fallback to mock for demo
      setRecoveryRequests(MOCK_RECOVERY);
    } finally {
      setLoadingRecovery(false);
    }
  };

  const handleCreateShareLink = async (credentialId: string) => {
    setShareLoading(credentialId);
    try {
      const result = await shareAPI.create(credentialId, 24, false);
      setShareLink(result.shareUrl);
      setActiveShareLink(credentialId);
      toast.success("Share link generated securely!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create share link");
    } finally {
      setShareLoading(null);
    }
  };

  const copyToClipboard = (text: string, type: "hash" | "link" = "hash", id: string = "") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(id);
      toast.success("Hash copied to clipboard");
      setTimeout(() => setCopiedHash(null), 2000);
    } else {
      toast.success("Link copied to clipboard");
    }
  };

  const tabs = [
    { id: "credentials", label: "My Credentials", icon: Wallet },
    { id: "skills", label: "Skill Profile", icon: Target },
    { id: "jobs", label: "Career Matches", icon: Briefcase },
    { id: "recovery", label: "Recovery", icon: RotateCcw },
  ] as const;

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
            <div className="h-6 w-px bg-parchment-300" />
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-ink-500" />
              <span className="font-bold text-xs uppercase tracking-widest text-ink-900">Career Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-600 hidden sm:block">{user?.name}</span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto px-6 py-12 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-12">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

        <AnimatePresence mode="wait">
          {/* TAB: CREDENTIALS */}
          {activeTab === "credentials" && (
            <motion.div key="credentials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8 flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">My Digital Wallet</h1>
                  <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                    Manage and share your cryptographically secured academic achievements.
                  </p>
                </div>
                <button 
                  onClick={handleDigilockerConnect}
                  disabled={isSimulatingDigilocker}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors shadow-md hover:shadow-lg flex-shrink-0 border border-blue-500 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" /> Import from DigiLocker
                </button>
              </div>

              {isSimulatingDigilocker ? (
                <div className="beanro-card p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto border-bronze/50 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />
                  
                  {digilockerStep === 5 ? (
                     <div className="mb-8 relative">
                       <div className="absolute inset-0 animate-ping bg-blue-400 rounded-lg opacity-30" />
                       <QrCode className="w-20 h-20 text-blue-500 relative z-10 animate-pulse" />
                     </div>
                  ) : digilockerStep === 4 ? (
                     <FileCheck className="w-20 h-20 text-blue-500 mb-8 animate-bounce" />
                  ) : (
                    <div className="w-16 h-16 border-4 border-parchment-300 border-t-blue-500 rounded-full animate-spin mb-8" />
                  )}

                  <h3 className="font-display font-bold text-2xl text-ink-900 mb-4 relative z-10">
                    {digilockerStep === 1 && "Connecting to DigiLocker API..."}
                    {digilockerStep === 2 && "Verifying Identity (Aadhaar KYC)..."}
                    {digilockerStep === 3 && "Fetching Academic Records..."}
                    {digilockerStep === 4 && <span className="text-blue-700">Converting to OCR Proof Immutable Record...</span>}
                    {digilockerStep === 5 && <span className="text-blue-700">Generating Unique Cryptographic QR Code...</span>}
                    {digilockerStep === 6 && "Cryptographically Sealing on Polygon Blockchain..."}
                  </h3>
                  <div className="w-64 h-2 bg-parchment-200 rounded-full overflow-hidden relative z-10 shadow-inner">
                    <motion.div 
                      className="h-full bg-blue-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(digilockerStep / 6) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : credentials.length === 0 ? (
                <div className="beanro-card text-center p-16">
                  <FileCheck className="w-16 h-16 text-parchment-400 mx-auto mb-6" />
                  <h2 className="font-display font-bold text-2xl text-ink-900 mb-2 uppercase">No Credentials Yet</h2>
                  <p className="text-ink-500 font-medium text-sm mb-6">Your university hasn't issued any credentials to this email address yet.</p>
                  <button onClick={handleDigilockerConnect} className="btn-primary mx-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 border-indigo-500">
                    <Sparkles className="w-4 h-4" /> Auto-Sync Demo Records
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {credentials.map((cred, i) => (
                    <motion.div 
                      key={cred.id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="beanro-card flex flex-col hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Expiry Badge */}
                      {cred.expiryDate && new Date(cred.expiryDate) < new Date() && (
                        <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">
                          Expired
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <span className={cred.status === "VALID" ? "badge-valid" : "badge-revoked"}>
                          {cred.status === "VALID" ? "✓ Valid on Polygon" : "✗ Revoked"}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                            {formatDate(cred.issueDate)}
                          </span>
                          {/* DigiLocker badge for government-attested credentials */}
                          {(cred.source === "DIGILOCKER_VERIFIED") && (
                            <DigiLockerBadge size="sm" />
                          )}
                        </div>
                      </div>

                      <div className="mb-6 flex-grow">
                        <h3 className="font-display font-bold text-xl text-ink-900 uppercase leading-tight mb-2">{cred.title}</h3>
                        <div className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-4">{getCredentialTypeLabel(cred.credentialType)}</div>
                        
                        <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-xl border border-parchment-200">
                          <div className="w-8 h-8 rounded-full bg-parchment-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-ink-600" />
                          </div>
                          <div className="text-sm font-bold text-ink-900 truncate">
                            {cred.issuer?.name || "Institution Name"}
                          </div>
                        </div>

                        {/* Immutable QR & OCR Proof Section */}
                        <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white flex gap-4 items-center">
                          <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-sm">
                            <QRCodeSVG 
                              value={`http://localhost:3000/verify?hash=${cred.credentialHash}`} 
                              size={64} 
                              level="H"
                              fgColor="#0f172a"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-1.5 mb-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">OCR-Proof</span>
                            </div>
                            <span className="text-[10px] font-bold text-ink-500 uppercase tracking-widest leading-snug">
                              Immutable visual QR embedded in official document
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-3">
                        <div className="bg-parchment-50 rounded-xl p-3 border border-parchment-200 flex justify-between items-center gap-2">
                          <div className="truncate text-xs font-mono text-ink-600">
                            {truncateHash(cred.credentialHash, 12)}
                          </div>
                          <button 
                            onClick={() => copyToClipboard(cred.credentialHash, "hash", cred.id)}
                            className="p-1.5 hover:bg-parchment-200 rounded-md transition-colors text-ink-600"
                          >
                            {copiedHash === cred.credentialHash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleCreateShareLink(cred.id)}
                            className="btn-secondary !py-2.5 flex items-center justify-center gap-2"
                            disabled={shareLoading === cred.id}
                          >
                            {shareLoading === cred.id ? (
                              <div className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
                            ) : (
                              <>
                                <Share2 className="w-4 h-4" /> Share
                              </>
                            )}
                          </button>
                          {/* Sealed PDF download — always serves the watermarked, signed official copy */}
                          <a 
                            href={`/api/credentials/${cred.credentialId || cred.id}/sealed-pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary !py-2.5 flex items-center justify-center gap-2"
                            title="Download the sealed, digitally-signed official copy"
                          >
                            <Download className="w-4 h-4" /> Sealed PDF
                          </a>
                        </div>

                        {/* Verification URL */}
                        {(cred.credentialId || cred.id) && (
                          <a
                            href={`/verify/${cred.credentialId || cred.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink-400 hover:text-bronze transition-colors"
                          >
                            <QrCode className="w-3 h-3" />
                            Public Verification URL ↗
                          </a>
                        )}

                        {activeShareLink === cred.id && shareLink && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 bg-white p-3 rounded-xl border border-bronze/30 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-ink-500 mb-2">Shareable Link (Valid 30 days)</p>
                            <div className="flex gap-2">
                              <input type="text" readOnly value={shareLink} className="flex-1 text-xs bg-parchment-50 border border-parchment-200 rounded-lg px-2 py-1.5 font-mono text-ink-700" />
                              <button onClick={() => copyToClipboard(shareLink, "link")} className="p-1.5 bg-bronze/10 text-bronze hover:bg-bronze/20 rounded-lg transition-colors">
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: SKILL PROFILE */}
          {activeTab === "skills" && (
            <motion.div key="skills" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">Skill Profile</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Micro-credentials stacked into a composite reputation score.
                </p>
              </div>

              {isSimulatingSkills ? (
                <div className="beanro-card p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto border-emerald-500/50">
                  <div className="w-16 h-16 border-4 border-parchment-300 border-t-emerald-500 rounded-full animate-spin mb-6" />
                  <h3 className="font-display font-bold text-2xl text-ink-900 mb-4">
                    {skillsStep === 1 && "Initializing Stack Engine..."}
                    {skillsStep === 2 && "Analyzing Micro-credentials..."}
                    {skillsStep === 3 && "Stacking Skill Weights..."}
                    {skillsStep === 4 && "Calculating Global Percentile..."}
                  </h3>
                  <div className="w-64 h-2 bg-parchment-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(skillsStep / 4) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : !skillProfile ? (
                <div className="beanro-card p-10 text-center max-w-2xl mx-auto">
                  <Layers className="w-16 h-16 text-ink-300 mx-auto mb-6" />
                  <h3 className="font-display font-bold text-2xl uppercase mb-2">No Profile Created</h3>
                  <p className="text-ink-600 mb-6">Stack your micro-credentials to create a public skill profile.</p>
                  <button className="btn-primary flex items-center gap-2 mx-auto" onClick={handleInitializeProfile}>
                    <RefreshCw className="w-4 h-4" /> Initialize Dynamic Profile
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="md:col-span-1">
                    <div className="beanro-card bg-ink-900 text-parchment-100 p-8 border-none relative overflow-hidden h-full flex flex-col justify-between">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-48 h-48" /></div>
                      <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-bronze mb-6">Composite Score</h2>
                        <div className="text-7xl font-display font-black mb-2">{skillProfile.totalScore.toFixed(1)}</div>
                        <p className="text-sm font-medium text-parchment-300 bg-white/10 inline-block px-3 py-1 rounded-full border border-white/20">Top 2% of Candidates</p>
                      </div>
                      
                      <div className="mt-12">
                        <h3 className="font-bold text-xl mb-3 text-white">{skillProfile.title}</h3>
                        <p className="text-sm text-parchment-300 leading-relaxed">{skillProfile.bio || "No bio added yet."}</p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-display font-bold text-2xl uppercase text-ink-900 mb-6">Stacked Micro-Credentials</h3>
                    <div className="grid gap-4">
                      {skillProfile.entries?.map((entry: any, idx: number) => (
                        <motion.div 
                          initial={{ x: 50, opacity: 0 }} 
                          animate={{ x: 0, opacity: 1 }} 
                          transition={{ delay: idx * 0.15 }}
                          key={entry.id} 
                          className="bg-white p-5 rounded-2xl border border-parchment-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-bronze/10 text-bronze flex items-center justify-center font-black text-lg border border-bronze/20">
                              {entry.weight.toFixed(1)}x
                            </div>
                            <div>
                              <h4 className="font-bold text-ink-900 text-lg mb-1">{entry.skillTag}</h4>
                              <p className="text-xs text-ink-500 uppercase tracking-widest">{entry.credential.title}</p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: CAREER MATCHES */}
          {activeTab === "jobs" && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">AI Career Matches</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Roles algorithmically matched to your verified credentials.
                </p>
              </div>

              {isSimulatingJobs ? (
                <div className="beanro-card p-16 flex flex-col items-center justify-center text-center max-w-2xl mx-auto border-purple-500/50">
                  <div className="w-16 h-16 border-4 border-parchment-300 border-t-purple-500 rounded-full animate-spin mb-6" />
                  <h3 className="font-display font-bold text-2xl text-ink-900 mb-4">
                    {jobsStep === 1 && "Waking up Gemini AI..."}
                    {jobsStep === 2 && "Reading your verified credentials..."}
                    {jobsStep === 3 && "Querying global job market..."}
                    {jobsStep === 4 && "Running LLM suitability analysis..."}
                  </h3>
                  <div className="w-64 h-2 bg-parchment-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-purple-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(jobsStep / 4) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ) : jobMatches.length === 0 ? (
                <div className="beanro-card text-center p-16 max-w-2xl mx-auto">
                  <BrainCircuit className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                  <h3 className="font-display font-bold text-2xl uppercase mb-2">No AI Analysis Run Yet</h3>
                  <p className="text-ink-600 mb-8">Run our Gemini-powered engine to match your cryptographic proofs against global job listings.</p>
                  <button onClick={handleRunAIMatch} className="btn-primary mx-auto flex items-center gap-2 bg-purple-600 hover:bg-purple-700 border-purple-500">
                    <Sparkles className="w-4 h-4" /> Run AI Matching Engine
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {jobMatches.map((match: any, i: number) => (
                    <motion.div 
                      key={match.id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="beanro-card p-8 border-l-4 border-l-bronze flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="font-display font-bold text-2xl text-ink-900 leading-tight">{match.title}</h3>
                          <p className="text-ink-500 text-sm font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> {match.company}
                          </p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-800 font-black text-sm px-4 py-2 rounded-full uppercase border border-emerald-200 flex flex-col items-center">
                          <span className="text-xs font-bold opacity-70">AI Score</span>
                          <span>{Math.round(match.matchScore)}%</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-ink-700 mb-8">
                        <span className="bg-parchment-200 px-4 py-2 rounded-xl">{match.location}</span>
                        <span className="bg-parchment-200 px-4 py-2 rounded-xl text-emerald-800">{match.salaryRange}</span>
                      </div>

                      <div className="bg-parchment-50 p-4 rounded-xl border border-parchment-200 mb-6">
                        <p className="text-xs font-bold uppercase text-ink-400 mb-3 tracking-widest">AI Reasoning</p>
                        <ul className="space-y-2">
                          {match.matchReasons?.map((reason: string, rIdx: number) => (
                            <li key={rIdx} className="text-sm font-medium text-ink-700 flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-parchment-200 pt-6 mt-auto">
                        <button className="btn-primary w-full flex justify-center items-center gap-2">
                          One-Click Apply with ProofMind Identity
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: RECOVERY */}
          {activeTab === "recovery" && (
            <motion.div key="recovery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">Credential Recovery</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Disaster recovery for displaced persons. Request re-attestation of lost documents.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="beanro-card p-8">
                  <h3 className="font-display font-bold text-2xl uppercase mb-6 border-b border-parchment-200 pb-4">Submit New Request</h3>
                  
                  {isSimulatingRecovery ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <RotateCcw className="w-12 h-12 text-bronze animate-spin mb-4" />
                      <h4 className="font-bold text-lg mb-2">
                        {recoveryStep === 1 && "Encoding Evidence Payload..."}
                        {recoveryStep === 2 && "Broadcasting to Institution Nodes..."}
                        {recoveryStep === 3 && "Awaiting Consensus..."}
                      </h4>
                      <p className="text-sm text-ink-500 uppercase tracking-widest">Decentralized network active</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSimulatedRecovery} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Institution ID</label>
                        <input type="text" required value={recoveryForm.institutionId} onChange={e => setRecoveryForm({...recoveryForm, institutionId: e.target.value})} className="input-field" placeholder="Enter University Node ID..." />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Original Degree Title</label>
                        <input type="text" required value={recoveryForm.originalTitle} onChange={e => setRecoveryForm({...recoveryForm, originalTitle: e.target.value})} className="input-field" placeholder="e.g. B.S. Mathematics (2018)" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Evidence Notes</label>
                        <textarea required value={recoveryForm.evidenceNotes} onChange={e => setRecoveryForm({...recoveryForm, evidenceNotes: e.target.value})} className="input-field min-h-[120px]" placeholder="Explain context... e.g., 'Records destroyed in flood. Please verify via alumni portal.'" />
                      </div>
                      <button type="submit" className="btn-primary w-full mt-2 py-4">Broadcast Recovery Request</button>
                    </form>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="font-display font-bold text-2xl uppercase">Network Requests</h3>
                  <AnimatePresence>
                    {recoveryRequests.map((req: any, i: number) => (
                      <motion.div 
                        key={req.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-2xl border border-parchment-200 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-bold text-xl">{req.originalTitle}</h4>
                          <span className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                            req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-ink-500 leading-relaxed bg-parchment-50 p-3 rounded-lg border border-parchment-100">
                          <span className="font-bold text-ink-900 block mb-1 uppercase tracking-widest text-[10px]">Submitted Evidence:</span>
                          {req.evidenceNotes}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {recoveryRequests.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-2xl border border-parchment-200 border-dashed">
                      <RotateCcw className="w-12 h-12 text-parchment-300 mx-auto mb-4" />
                      <p className="text-ink-500 font-medium">No recovery requests broadcasted yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
