"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Wallet, LogOut, FileCheck, Share2, Target, Briefcase, Award, RotateCcw,
  CheckCircle2, XCircle, Copy, Check, Download, QrCode, Building2
} from "lucide-react";
import { credentialsAPI, shareAPI, skillsAPI, jobsAPI, recoveryAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, getCredentialTypeLabel, truncateHash } from "@/lib/utils";
import { toast } from "sonner";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, clearAuth } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"credentials" | "skills" | "jobs" | "recovery">("credentials");

  // Credentials State
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState("");
  const [activeShareLink, setActiveShareLink] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Skill Profile State
  const [skillProfile, setSkillProfile] = useState<any>(null);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Job Matches State
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Recovery State
  const [recoveryRequests, setRecoveryRequests] = useState<any[]>([]);
  const [loadingRecovery, setLoadingRecovery] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ institutionId: "", originalTitle: "", evidenceNotes: "" });

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (user.role !== "STUDENT") {
      router.push("/");
      return;
    }
    
    if (activeTab === "credentials") loadCredentials();
    if (activeTab === "skills") loadSkills();
    if (activeTab === "jobs") loadJobs();
    if (activeTab === "recovery") loadRecovery();
  }, [user, router, activeTab]);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const data = await credentialsAPI.mine();
      setCredentials(data);
    } catch (err) {
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
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
      const data = await jobsAPI.matches();
      setJobMatches(data);
    } catch (err) {
      toast.error("Failed to load job matches");
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadRecovery = async () => {
    setLoadingRecovery(true);
    try {
      const data = await recoveryAPI.mine();
      setRecoveryRequests(data);
    } catch (err) {
      toast.error("Failed to load recovery requests");
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

  const submitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recoveryAPI.request(recoveryForm);
      toast.success("Recovery request submitted");
      setRecoveryForm({ institutionId: "", originalTitle: "", evidenceNotes: "" });
      loadRecovery();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
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
              <ShieldCheck className="w-6 h-6 text-bronze group-hover:rotate-12 transition-transform duration-500" />
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
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">My Digital Wallet</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Manage and share your cryptographically secured academic achievements.
                </p>
              </div>

              {loading ? (
                <div className="p-16 text-center">
                  <div className="w-8 h-8 border-2 border-parchment-300 border-t-bronze rounded-full animate-spin mx-auto" />
                </div>
              ) : credentials.length === 0 ? (
                <div className="beanro-card text-center p-16">
                  <FileCheck className="w-16 h-16 text-parchment-400 mx-auto mb-6" />
                  <h2 className="font-display font-bold text-2xl text-ink-900 mb-2 uppercase">No Credentials Yet</h2>
                  <p className="text-ink-500 font-medium text-sm">Your university hasn't issued any credentials to this email address yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {credentials.map((cred) => (
                    <motion.div 
                      key={cred.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="beanro-card flex flex-col hover:-translate-y-1 relative overflow-hidden"
                    >
                      {/* Expiry Badge */}
                      {cred.expiryDate && new Date(cred.expiryDate) < new Date() && (
                        <div className="absolute top-4 right-4 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-200">
                          Expired
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-6">
                        <span className={cred.status === "VALID" ? "badge-valid" : "badge-revoked"}>
                          {cred.status === "VALID" ? "✓ Valid on Polygon" : "✗ Revoked"}
                        </span>
                        <span className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">
                          {formatDate(cred.issueDate)}
                        </span>
                      </div>

                      <div className="mb-6 flex-grow">
                        <h3 className="font-display font-bold text-xl text-ink-900 uppercase leading-tight mb-2">{cred.title}</h3>
                        <div className="text-xs font-bold uppercase tracking-widest text-ink-500 mb-4">{getCredentialTypeLabel(cred.credentialType)}</div>
                        
                        <div className="flex items-center gap-2 mb-4 bg-white p-3 rounded-xl border border-parchment-200">
                          <div className="w-8 h-8 rounded-full bg-parchment-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-ink-600" />
                          </div>
                          <div className="text-sm font-bold text-ink-900 truncate">
                            {cred.issuer.name}
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
                          {cred.ipfsCid && (
                            <a 
                              href={`http://127.0.0.1:8080/ipfs/${cred.ipfsCid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-secondary !py-2.5 flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" /> PDF
                            </a>
                          )}
                        </div>

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

              {loadingSkills ? (
                <div className="p-16 text-center"><div className="w-8 h-8 border-2 border-t-bronze rounded-full animate-spin mx-auto" /></div>
              ) : !skillProfile ? (
                <div className="beanro-card p-10 text-center max-w-2xl mx-auto">
                  <Award className="w-12 h-12 text-ink-300 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-2xl uppercase mb-2">No Profile Created</h3>
                  <p className="text-ink-600 mb-6">Stack your micro-credentials to create a public skill profile.</p>
                  <button className="btn-primary" onClick={() => skillsAPI.updateProfile({ title: "My Profile" }).then(loadSkills)}>Initialize Profile</button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <div className="beanro-card bg-ink-900 text-parchment-100 p-8 border-none relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-32 h-32" /></div>
                      <h2 className="text-xs font-bold uppercase tracking-widest text-bronze mb-6">Composite Score</h2>
                      <div className="text-6xl font-display font-black mb-2">{skillProfile.totalScore.toFixed(1)}</div>
                      <p className="text-sm font-medium text-parchment-300">Top 5% of Candidates</p>
                      
                      <div className="mt-8">
                        <h3 className="font-bold text-lg mb-2">{skillProfile.title}</h3>
                        <p className="text-sm text-parchment-300">{skillProfile.bio || "No bio added yet."}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-6">
                    <h3 className="font-display font-bold text-2xl uppercase text-ink-900">Stacked Micro-Credentials</h3>
                    <div className="space-y-4">
                      {skillProfile.entries?.map((entry: any) => (
                        <div key={entry.id} className="bg-white p-4 rounded-xl border border-parchment-200 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-bronze/10 text-bronze flex items-center justify-center font-bold">
                              {entry.weight}x
                            </div>
                            <div>
                              <h4 className="font-bold text-ink-900">{entry.skillTag}</h4>
                              <p className="text-xs text-ink-500 uppercase tracking-wider">{entry.credential.title}</p>
                            </div>
                          </div>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                      ))}
                      {(!skillProfile.entries || skillProfile.entries.length === 0) && (
                        <div className="text-center p-8 bg-parchment-50 rounded-xl border border-parchment-200 border-dashed">
                          <p className="text-ink-500 text-sm font-medium">No skills stacked yet.</p>
                        </div>
                      )}
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

              {loadingJobs ? (
                <div className="p-16 text-center"><div className="w-8 h-8 border-2 border-t-bronze rounded-full animate-spin mx-auto" /></div>
              ) : jobMatches.length === 0 ? (
                <div className="beanro-card text-center p-16 max-w-2xl mx-auto">
                  <Briefcase className="w-12 h-12 text-ink-300 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-2xl uppercase mb-2">No Perfect Matches Found</h3>
                  <p className="text-ink-600">Acquire more credentials to unlock high-tier job matches.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {jobMatches.map((match: any) => (
                    <div key={match.id} className="beanro-card p-6 border-l-4 border-l-bronze flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-display font-bold text-2xl text-ink-900 leading-tight">{match.title}</h3>
                          <p className="text-ink-500 text-sm font-bold uppercase tracking-widest mt-1">{match.company}</p>
                        </div>
                        <div className="bg-emerald-100 text-emerald-800 font-black text-sm px-3 py-1 rounded-full uppercase">
                          {Math.round(match.matchScore)}% Match
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-xs font-medium text-ink-600 mb-6">
                        <span className="bg-parchment-200 px-3 py-1 rounded-full">{match.location}</span>
                        <span className="bg-parchment-200 px-3 py-1 rounded-full">{match.salaryRange}</span>
                      </div>

                      <div className="border-t border-parchment-200 pt-4 mt-auto">
                        <button className="btn-primary w-full flex justify-center items-center gap-2">
                          Apply with ProofMind Profile
                        </button>
                      </div>
                    </div>
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
                  <form onSubmit={submitRecovery} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Institution ID</label>
                      <input type="text" required value={recoveryForm.institutionId} onChange={e => setRecoveryForm({...recoveryForm, institutionId: e.target.value})} className="input-field" placeholder="Enter ID..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Original Degree Title</label>
                      <input type="text" required value={recoveryForm.originalTitle} onChange={e => setRecoveryForm({...recoveryForm, originalTitle: e.target.value})} className="input-field" placeholder="e.g. B.S. Mathematics (2018)" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Evidence Notes</label>
                      <textarea required value={recoveryForm.evidenceNotes} onChange={e => setRecoveryForm({...recoveryForm, evidenceNotes: e.target.value})} className="input-field min-h-[100px]" placeholder="Explain context..." />
                    </div>
                    <button type="submit" className="btn-primary w-full mt-4">Submit to Institution</button>
                  </form>
                </div>

                <div className="space-y-6">
                  <h3 className="font-display font-bold text-2xl uppercase">My Requests</h3>
                  {loadingRecovery ? (
                    <div className="w-8 h-8 border-2 border-t-bronze rounded-full animate-spin" />
                  ) : recoveryRequests.length === 0 ? (
                    <p className="text-ink-500 font-medium">No recovery requests found.</p>
                  ) : (
                    recoveryRequests.map((req: any) => (
                      <div key={req.id} className="bg-white p-5 rounded-2xl border border-parchment-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">{req.originalTitle}</h4>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                            req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-xs text-ink-500 line-clamp-2">{req.evidenceNotes}</p>
                      </div>
                    ))
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
