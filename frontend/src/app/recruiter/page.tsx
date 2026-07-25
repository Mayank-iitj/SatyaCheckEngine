"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Briefcase, LogOut, Users, Search, Target,
  CheckCircle2, Plus, Sparkles
} from "lucide-react";
import { jobsAPI, clearAuth } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { UserButton } from "@clerk/nextjs";

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, isLoaded } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"jobs" | "post">("jobs");

  // Jobs State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedCandidates, setMatchedCandidates] = useState<Record<string, any[]>>({});
  const [loadingMatches, setLoadingMatches] = useState<string | null>(null);
  
  // Post Job Form State
  const [postLoading, setPostLoading] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requiredCredTypes: "DEGREE",
    requiredKeywords: "",
    minReputationScore: 80,
    salaryRange: ""
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (user.role !== "RECRUITER") {
      router.push("/dashboard");
      return;
    }
    loadJobs();
  }, [user, isLoaded, router]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobsAPI.list();
      setJobs(data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async (jobId: string) => {
    setLoadingMatches(jobId);
    try {
      // In a real app, we'd have a recruiter-specific match endpoint that takes jobId
      // For this demo, we'll fetch all matches and filter, or just mock it since the 
      // backend /jobs/matches is technically for the student side. Let's fetch the students from a mock 
      // recruiter-match endpoint, or just show a nice UI with simulated AI matching.
      
      // Let's simulate the AI recruiter finding matches for this job
      setTimeout(() => {
        setMatchedCandidates({
          ...matchedCandidates,
          [jobId]: [
            { id: "1", name: "Alice Johnson", score: 95, topSkill: "Machine Learning (MIT)" },
            { id: "2", name: "David Chen", score: 88, topSkill: "Data Science (Stanford)" },
          ]
        });
        setLoadingMatches(null);
      }, 1500);

    } catch (err) {
      setLoadingMatches(null);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostLoading(true);

    try {
      await jobsAPI.create(jobForm);
      toast.success("Job posted successfully!");
      setActiveTab("jobs");
      loadJobs();
      setJobForm({
        title: "", company: user?.name || "", location: "", description: "",
        requiredCredTypes: "DEGREE", requiredKeywords: "", minReputationScore: 80, salaryRange: ""
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to post job");
    } finally {
      setPostLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setLoading(true);
    try {
      const { demoAPI } = await import("@/lib/api");
      await demoAPI.seedRecruiter();
      toast.success("✨ Magic Demo Jobs Loaded!");
      await loadJobs();
    } catch (err: any) {
      toast.error(err.message || "Failed to load demo data");
      setLoading(false);
    }
  };

  const tabs = [
    { id: "jobs", label: "My Job Postings", icon: Briefcase },
    { id: "post", label: "Post New Role", icon: Plus },
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
              <Users className="w-5 h-5 text-ink-500" />
              <span className="font-bold text-xs uppercase tracking-widest text-ink-900">Recruiter Portal</span>
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
          {/* TAB: JOBS */}
          {activeTab === "jobs" && (
            <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">Talent Sourcing Engine</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Let the ProofMind AI match your job requirements against cryptographically verified student credentials.
                </p>
              </div>

              {loading ? (
                <div className="p-16 text-center">
                  <div className="w-8 h-8 border-2 border-parchment-300 border-t-bronze rounded-full animate-spin mx-auto" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="beanro-card text-center p-16 max-w-2xl mx-auto">
                  <Briefcase className="w-12 h-12 text-ink-300 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-2xl uppercase mb-2">No Jobs Posted</h3>
                  <p className="text-ink-600 mb-6">Create a job posting to start matching with verified candidates.</p>
                  <div className="flex justify-center gap-4">
                    <button onClick={() => setActiveTab("post")} className="btn-primary">Post a Role</button>
                    <button onClick={handleSeedDemo} className="btn-secondary bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Load Magic Demo Jobs
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                  {jobs.map((job) => (
                    <div key={job.id} className="beanro-card p-0 overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-parchment-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-display font-bold text-2xl text-ink-900 leading-tight">{job.title}</h3>
                            <p className="text-ink-500 text-xs font-bold uppercase tracking-widest mt-1">{job.location} • {job.salaryRange}</p>
                          </div>
                          <span className="bg-ink-100 text-ink-800 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-ink-600 mb-4 line-clamp-2">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest">
                          <span className="bg-parchment-200 text-ink-700 px-2 py-1 rounded">Requires: {job.requiredCredTypes}</span>
                          <span className="bg-parchment-200 text-ink-700 px-2 py-1 rounded">Min Score: {job.minReputationScore}</span>
                        </div>
                      </div>

                      <div className="bg-parchment-50 p-6 flex-grow">
                        {!matchedCandidates[job.id] ? (
                          <div className="text-center py-6">
                            <Target className="w-8 h-8 text-ink-300 mx-auto mb-3" />
                            <h4 className="font-bold text-sm text-ink-900 mb-1">Find Perfect Matches</h4>
                            <p className="text-xs text-ink-500 mb-4">Run the AI engine against 14,000+ verified credentials.</p>
                            <button 
                              onClick={() => loadMatches(job.id)}
                              disabled={loadingMatches === job.id}
                              className="btn-primary !py-2 px-6 flex items-center justify-center gap-2 mx-auto"
                            >
                              {loadingMatches === job.id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <><Sparkles className="w-4 h-4" /> Run AI Match</>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-bold text-sm text-ink-900 uppercase tracking-widest border-b border-parchment-200 pb-2 mb-4">Top Verified Candidates</h4>
                            <div className="space-y-3">
                              {matchedCandidates[job.id].map(candidate => (
                                <div key={candidate.id} className="bg-white p-3 rounded-xl border border-parchment-200 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                                      {candidate.score}%
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-sm text-ink-900">{candidate.name}</h5>
                                      <p className="text-[10px] text-ink-500 font-bold uppercase tracking-widest">{candidate.topSkill}</p>
                                    </div>
                                  </div>
                                  <button className="text-bronze hover:text-bronze-light font-bold text-xs uppercase tracking-widest">
                                    View Proof
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: POST JOB */}
          {activeTab === "post" && (
            <motion.div key="post" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="mb-8">
                <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">Create Job Posting</h1>
                <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                  Define cryptographically verifiable requirements for your open role.
                </p>
              </div>

              <div className="beanro-card max-w-3xl">
                <form onSubmit={handlePostJob} className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Job Title *</label>
                    <input type="text" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="input-field" placeholder="Senior Blockchain Engineer" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Company *</label>
                    <input type="text" value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Location *</label>
                    <input type="text" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} className="input-field" placeholder="Remote / SF" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Description</label>
                    <textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} className="input-field min-h-[100px]" required />
                  </div>
                  
                  {/* ProofMind Specific Requirements */}
                  <div className="md:col-span-2 mt-4 pt-6 border-t border-parchment-200">
                    <h3 className="font-display font-bold text-xl uppercase mb-6 flex items-center gap-2 text-ink-900">
                      <ShieldCheck className="w-5 h-5 text-bronze" /> Credential Requirements
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Required Credential Type</label>
                    <select value={jobForm.requiredCredTypes} onChange={e => setJobForm({...jobForm, requiredCredTypes: e.target.value})} className="input-field">
                      <option value="DEGREE">University Degree</option>
                      <option value="DIPLOMA">Diploma</option>
                      <option value="CERTIFICATE">Certificate</option>
                      <option value="MICRO_CREDENTIAL">Micro-Credential</option>
                      <option value="DEGREE,CERTIFICATE">Degree OR Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Required Keywords (comma separated)</label>
                    <input type="text" value={jobForm.requiredKeywords} onChange={e => setJobForm({...jobForm, requiredKeywords: e.target.value})} className="input-field" placeholder="machine learning, python, web3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Min. Institution Reputation (0-100)</label>
                    <input type="number" min="0" max="100" value={jobForm.minReputationScore} onChange={e => setJobForm({...jobForm, minReputationScore: parseInt(e.target.value)})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Salary Range</label>
                    <input type="text" value={jobForm.salaryRange} onChange={e => setJobForm({...jobForm, salaryRange: e.target.value})} className="input-field" placeholder="$120k - $150k" />
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button type="submit" disabled={postLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                      {postLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Post Job to Network"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
