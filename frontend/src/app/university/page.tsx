"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Building2, FileCheck, Plus, LogOut,
  CheckCircle2, XCircle, Upload, Eye, RotateCcw, Activity
} from "lucide-react";
import { credentialsAPI, getStoredUser, clearAuth, recoveryAPI } from "@/lib/api";
import { formatDate, getCredentialTypeLabel, truncateHash } from "@/lib/utils";
import { toast } from "sonner";

export default function UniversityDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [activeTab, setActiveTab] = useState<"credentials" | "recovery" | "reputation">("credentials");

  // Credentials State
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Issue form state
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueMode, setIssueMode] = useState<"single" | "batch">("single");
  const [batchJson, setBatchJson] = useState("");
  const [issueResult, setIssueResult] = useState<any>(null);

  const [studentEmail, setStudentEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [credentialType, setCredentialType] = useState("DEGREE");
  const [title, setTitle] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);

  // Recovery State
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [loadingRecovery, setLoadingRecovery] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u || u.role !== "UNIVERSITY") {
      router.push("/auth/login");
      return;
    }
    setUser(u);
    loadCredentials();
    loadRecovery();
  }, []);

  const loadCredentials = async () => {
    try {
      const data = await credentialsAPI.issued();
      setCredentials(data);
    } catch (err) {
      console.error("Failed to load credentials:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecovery = async () => {
    setLoadingRecovery(true);
    try {
      const data = await recoveryAPI.pending();
      setRecoveryRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecovery(false);
    }
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssueLoading(true);
    setIssueResult(null);

    try {
      if (issueMode === "single") {
        const formData = new FormData();
        formData.append("studentEmail", studentEmail);
        formData.append("recipientName", recipientName);
        formData.append("credentialType", credentialType);
        formData.append("title", title);
        formData.append("issueDate", issueDate);
        
        const result = await credentialsAPI.issue(formData);
        setIssueResult(result);
        toast.success("Credential Issued Successfully!");
      } else {
        // Mock Batch Issuance
        toast.success("Merkle Batch Published On-Chain Successfully!");
        setIssueResult({ message: "Batch of credentials secured via Merkle Root.", txHash: "0x" + Math.random().toString(16).slice(2) });
      }
      
      loadCredentials();
      setStudentEmail(""); setRecipientName(""); setTitle("");
    } catch (err: any) {
      toast.error(err.message || "Failed to issue");
      setIssueResult({ error: err.message });
    } finally {
      setIssueLoading(false);
    }
  };

  const handleAttest = async (id: string, approved: boolean) => {
    try {
      await recoveryAPI.attest(id, approved, approved ? "Records verified in archive." : "Record not found.");
      toast.success(approved ? "Request approved" : "Request rejected");
      loadRecovery();
    } catch (err: any) {
      toast.error("Failed to attest: " + err.message);
    }
  };

  const validCount = credentials.filter((c) => c.status === "VALID").length;
  const revokedCount = credentials.filter((c) => c.status === "REVOKED").length;

  const tabs = [
    { id: "credentials", label: "Credentials", icon: FileCheck },
    { id: "recovery", label: "Recovery Requests", icon: RotateCcw },
    { id: "reputation", label: "Reputation & Staking", icon: Activity },
  ] as const;

  return (
    <div className="min-h-screen bg-parchment-100 text-ink-900 relative">
      <div className="fixed inset-0 pointer-events-none bg-grid-lines z-0" />
      
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
              <Building2 className="w-5 h-5 text-ink-500" />
              <span className="font-bold text-xs uppercase tracking-widest text-ink-900">University Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-ink-600 hidden sm:block">{user?.name}</span>
            <button onClick={() => { clearAuth(); router.push("/auth/login"); }} className="p-2 text-ink-400 hover:text-brand-revoked transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
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
              
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
                {[
                  { label: "Total Issued", value: credentials.length, icon: FileCheck, color: "text-ink-900" },
                  { label: "Valid", value: validCount, icon: CheckCircle2, color: "text-brand-valid" },
                  { label: "Revoked", value: revokedCount, icon: XCircle, color: "text-brand-revoked" },
                  { label: "Verifications", value: credentials.reduce((sum, c) => sum + (c._count?.verificationLogs || 0), 0), icon: Eye, color: "text-bronze" },
                ].map((stat) => (
                  <div key={stat.label} className="beanro-card flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-parchment-300 bg-white flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="font-display font-black text-3xl text-ink-900">{stat.value}</div>
                      <div className="text-[10px] font-bold tracking-widest uppercase text-ink-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Issue Credential Toggle */}
              <div className="mb-10 flex justify-between items-end">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900">Manage Credentials</h1>
                <button onClick={() => setShowIssueForm(!showIssueForm)} className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Issue New
                </button>
              </div>

              {/* Issue Form */}
              {showIssueForm && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="beanro-card mb-12">
                  <div className="flex justify-between items-center mb-8 border-b border-parchment-200 pb-4">
                    <h2 className="font-display font-bold text-2xl uppercase text-ink-900">Issue Credentials</h2>
                    <div className="flex gap-2 bg-parchment-100 p-1 rounded-lg">
                      <button onClick={() => setIssueMode("single")} className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${issueMode === "single" ? "bg-white shadow-sm text-ink-900" : "text-ink-500"}`}>Single</button>
                      <button onClick={() => setIssueMode("batch")} className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${issueMode === "batch" ? "bg-white shadow-sm text-ink-900" : "text-ink-500"}`}>Batch (Merkle)</button>
                    </div>
                  </div>

                  {issueResult && !issueResult.error && (
                    <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <div className="flex items-center gap-2 text-brand-valid font-bold uppercase tracking-widest text-xs mb-3">
                        <CheckCircle2 className="w-4 h-4" /> Success
                      </div>
                      <div className="text-sm text-emerald-800 font-medium">
                        <p>{issueResult.message || "Credential Issued!"}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleIssue}>
                    {issueMode === "single" ? (
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Student Email *</label>
                          <input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} className="input-field" placeholder="student@example.com" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Recipient Name *</label>
                          <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="input-field" placeholder="Full name" required />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Type *</label>
                          <select value={credentialType} onChange={(e) => setCredentialType(e.target.value)} className="input-field">
                            <option value="DEGREE">Degree</option>
                            <option value="MICRO_CREDENTIAL">Micro-Credential</option>
                            <option value="CERTIFICATE">Certificate</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Title *</label>
                          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-700">JSON Batch Array</label>
                        <textarea 
                          className="input-field font-mono text-xs min-h-[150px]" 
                          placeholder='[{"studentEmail": "...", "title": "..."}]'
                          value={batchJson}
                          onChange={e => setBatchJson(e.target.value)}
                        />
                        <p className="text-xs text-ink-500 font-medium">Batch issuance utilizes a Merkle Tree to anchor thousands of records in a single L2 transaction, saving 99% in gas fees.</p>
                      </div>
                    )}
                    
                    <div className="pt-6">
                      <button type="submit" disabled={issueLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                        {issueLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload className="w-4 h-4" /> Issue & Anchor on Polygon</>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Credentials Table */}
              <div className="beanro-card !p-0 overflow-hidden">
                {loading ? (
                  <div className="p-16 text-center">
                    <div className="w-8 h-8 border-2 border-parchment-300 border-t-bronze rounded-full animate-spin mx-auto" />
                  </div>
                ) : credentials.length === 0 ? (
                  <div className="p-16 text-center">
                    <FileCheck className="w-12 h-12 text-parchment-400 mx-auto mb-6" />
                    <p className="text-ink-500 font-medium">No credentials issued yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-bold text-ink-500 uppercase tracking-widest border-b border-parchment-200">
                          <th className="px-8 py-5">Recipient</th>
                          <th className="px-8 py-5">Title</th>
                          <th className="px-8 py-5">Type</th>
                          <th className="px-8 py-5">Date</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5">Hash</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-parchment-200">
                        {credentials.map((cred) => (
                          <tr key={cred.id} className="hover:bg-white transition-colors">
                            <td className="px-8 py-5">
                              <div className="font-bold text-sm text-ink-900">{cred.student?.name || cred.recipientName}</div>
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-ink-700 max-w-xs truncate">{cred.title}</td>
                            <td className="px-8 py-5">
                              <span className="badge-pending">{getCredentialTypeLabel(cred.credentialType)}</span>
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-ink-600">{formatDate(cred.issueDate)}</td>
                            <td className="px-8 py-5">
                              <span className={cred.status === "VALID" ? "badge-valid" : "badge-revoked"}>
                                {cred.status === "VALID" ? "✓ Valid" : "✗ Revoked"}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <code className="text-xs bg-parchment-100 border border-parchment-200 px-2 py-1 rounded font-mono text-ink-600">
                                {truncateHash(cred.credentialHash, 6)}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: RECOVERY */}
          {activeTab === "recovery" && (
            <motion.div key="recovery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">Disaster Recovery Requests</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Review and attest to credentials requested by displaced persons or refugees.
                </p>
              </div>

              {loadingRecovery ? (
                <div className="p-16 text-center"><div className="w-8 h-8 border-2 border-t-bronze rounded-full animate-spin mx-auto" /></div>
              ) : recoveryRequests.length === 0 ? (
                <div className="beanro-card text-center p-16">
                  <p className="text-ink-500 font-medium">No pending requests.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recoveryRequests.map(req => (
                    <div key={req.id} className="beanro-card p-6 border-l-4 border-l-yellow-400">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-xl mb-1">{req.student.name}</h3>
                          <p className="text-xs text-ink-500 uppercase tracking-widest">{req.student.email}</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 font-black text-xs px-3 py-1 rounded-full uppercase">
                          Action Required
                        </span>
                      </div>
                      
                      <div className="bg-parchment-50 p-4 rounded-xl border border-parchment-200 mb-6">
                        <p className="text-sm font-bold text-ink-900 mb-2">Requested Credential: {req.originalTitle}</p>
                        <p className="text-xs text-ink-600 italic">" {req.evidenceNotes} "</p>
                      </div>

                      <div className="flex gap-4">
                        <button onClick={() => handleAttest(req.id, true)} className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 flex-1">
                          Verify & Approve Request
                        </button>
                        <button onClick={() => handleAttest(req.id, false)} className="btn-primary !bg-red-600 hover:!bg-red-700 flex-1">
                          Reject Request
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: REPUTATION */}
          {activeTab === "reputation" && (
            <motion.div key="reputation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">Institutional Staking</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Your cryptographic reputation and security bond.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="beanro-card bg-ink-900 text-parchment-100 p-10 border-none relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck className="w-48 h-48" /></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-bronze mb-6">Current Stake Bond</h3>
                  <div className="text-6xl font-display font-black mb-2">$50,000</div>
                  <p className="text-sm font-medium text-parchment-300 mb-8">Securing 14,205 Issued Credentials</p>
                  
                  <button className="bg-bronze hover:bg-bronze/90 text-white font-bold text-sm uppercase tracking-widest py-3 px-6 rounded-lg transition-colors w-full">
                    Increase Stake Bond
                  </button>
                </div>

                <div className="beanro-card p-10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-6">Reputation Score</h3>
                  <div className="text-6xl font-display font-black text-ink-900 mb-2">98.5</div>
                  <p className="text-sm font-medium text-ink-600 mb-8">Tier: <span className="font-black text-bronze">ENTERPRISE</span></p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-parchment-200 pb-2">
                      <span className="text-ink-600 font-medium">Fraud Reports</span>
                      <span className="font-bold text-ink-900">0</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-parchment-200 pb-2">
                      <span className="text-ink-600 font-medium">Uptime Guarantee</span>
                      <span className="font-bold text-emerald-600">99.99%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
