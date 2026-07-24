"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { adminAPI, leaderboardAPI, plagiarismAPI } from "@/lib/api";
import { Users, Building2, ShieldAlert, FileCheck, Eye, LogOut, Plus, RefreshCw, Activity, AlertTriangle, Fingerprint, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { UserButton } from "@clerk/nextjs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { truncateHash } from "@/lib/utils";

export default function AdminDashboard() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"overview" | "institutions" | "plagiarism" | "logs">("overview");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Plagiarism state (Mock for demo, but hitting API)
  const [plagiarismReports, setPlagiarismReports] = useState<any[]>([]);
  
  const [showAddInst, setShowAddInst] = useState(false);
  const [newInstName, setNewInstName] = useState("");
  const [newInstEmail, setNewInstEmail] = useState("");
  const [newInstPassword, setNewInstPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, instData, logsData, plagData] = await Promise.all([
        leaderboardAPI.stats(),
        adminAPI.getInstitutions(),
        adminAPI.getAuditLogs(),
        plagiarismAPI.getAllReports().catch(() => ({ reports: [] }))
      ]);
      setStats(statsData);
      setInstitutions(instData.institutions);
      setLogs(logsData.logs);
      if (plagData && plagData.reports) setPlagiarismReports(plagData.reports);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const logsData = await adminAPI.getAuditLogs();
      setLogs(logsData.logs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminAPI.createInstitution({
        name: newInstName,
        email: newInstEmail,
        password: newInstPassword
      });
      setShowAddInst(false);
      setNewInstName("");
      setNewInstEmail("");
      setNewInstPassword("");
      fetchData(); // Refresh list
    } catch (err) {
      alert("Failed to create institution");
    } finally {
      setActionLoading(false);
    }
  };

  const updateInstStatus = async (id: string, newStatus: "APPROVED" | "SUSPENDED" | "REVOKED") => {
    try {
      await adminAPI.updateInstitutionStatus(id, newStatus);
      toast.success(`Institution status updated to ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update institution");
    }
  };

  const slashInstitution = async (id: string, instName: string) => {
    if (window.confirm(`Are you sure you want to SLASH the stake bond for ${instName}? This will deduct $10,000 from their bond due to fraudulent activity.`)) {
      toast.success(`Slashed $10,000 from ${instName}'s stake bond! (Demo)`);
      // In a real app, hit a slashing endpoint
    }
  };

  const tabs = [
    { id: "overview", label: "Global Stats", icon: Activity },
    { id: "institutions", label: "Institutions & Slashing", icon: Building2 },
    { id: "plagiarism", label: "Plagiarism Reports", icon: Fingerprint },
    { id: "logs", label: "Audit Logs", icon: ShieldAlert },
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
              <ShieldAlert className="w-5 h-5 text-brand-revoked" />
              <span className="font-bold text-xs uppercase tracking-widest text-ink-900">Admin Control</span>
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

        {loading && !stats ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-parchment-300 border-t-bronze rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-12">
                  {[
                    { label: "Credentials Verified", value: stats?.credentialsVerified.toLocaleString() || "0", icon: Eye, color: "text-emerald-600" },
                    { label: "Institutions", value: stats?.institutionsOnboarded || "0", icon: Building2, color: "text-bronze" },
                    { label: "Fraud Blocked", value: stats?.fraudBlocked || "0", icon: ShieldAlert, color: "text-brand-revoked" },
                    { label: "Jobs Matched", value: stats?.jobsMatched || "0", icon: Users, color: "text-blue-600" },
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

                {/* Analytics Graph */}
                <div className="beanro-card mb-12">
                  <div className="mb-6 flex justify-between items-center">
                    <div>
                      <h2 className="font-display font-bold text-2xl uppercase text-ink-900">Network Activity</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-500 mt-1">Cross-Chain Verifications</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-brand-valid"><div className="w-2 h-2 rounded-full bg-brand-valid"/> Verifications</span>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Mon', verifications: 1240 },
                        { name: 'Tue', verifications: 1560 },
                        { name: 'Wed', verifications: 2890 },
                        { name: 'Thu', verifications: 2130 },
                        { name: 'Fri', verifications: 3500 },
                        { name: 'Sat', verifications: 1800 },
                        { name: 'Sun', verifications: 2500 },
                      ]}>
                        <defs>
                          <linearGradient id="colorVerif" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D9C5" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8C8273', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8C8273', fontWeight: 'bold' }} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5D9C5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#059669', fontWeight: 'bold', fontSize: '12px' }}
                          labelStyle={{ color: '#8C8273', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="verifications" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorVerif)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: INSTITUTIONS */}
            {activeTab === "institutions" && (
              <motion.div key="institutions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {/* Action Toggle */}
                <div className="mb-10 flex justify-between items-end">
                  <h1 className="font-display font-black text-4xl uppercase text-ink-900">Institution Management</h1>
                  <button onClick={() => setShowAddInst(!showAddInst)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Institution
                  </button>
                </div>

                {/* Add Institution Form */}
                {showAddInst && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="beanro-card mb-12">
                    <h2 className="font-display font-bold text-2xl uppercase text-ink-900 mb-8 border-b border-parchment-200 pb-4">Register New Institution</h2>
                    <form onSubmit={handleAddInstitution} className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Institution Name *</label>
                        <input type="text" value={newInstName} onChange={(e) => setNewInstName(e.target.value)} className="input-field" placeholder="University of Technology" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Admin Email *</label>
                        <input type="email" value={newInstEmail} onChange={(e) => setNewInstEmail(e.target.value)} className="input-field" placeholder="admin@university.edu" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-ink-700 mb-2">Admin Password *</label>
                        <input type="password" value={newInstPassword} onChange={(e) => setNewInstPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
                      </div>
                      <div className="md:col-span-2 pt-4">
                        <button type="submit" disabled={actionLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                          {actionLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Register Institution"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Institutions Table */}
                <div className="beanro-card !p-0 overflow-hidden mb-12">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-bold text-ink-500 uppercase tracking-widest border-b border-parchment-200">
                          <th className="px-8 py-5">Institution</th>
                          <th className="px-8 py-5">Stake Bond</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-parchment-200">
                        {institutions.map((inst) => (
                          <tr key={inst.id} className="hover:bg-white transition-colors">
                            <td className="px-8 py-5">
                              <div className="font-bold text-sm text-ink-900">{inst.name}</div>
                              <div className="text-xs text-ink-500 mt-1">{inst.email || "No Email"}</div>
                            </td>
                            <td className="px-8 py-5">
                              <span className="font-mono font-bold text-ink-700 text-sm">${inst.stakeBond?.toLocaleString() || "0"}</span>
                            </td>
                            <td className="px-8 py-5">
                              <span className={inst.status === "APPROVED" ? "badge-valid" : inst.status === "PENDING" ? "badge-pending" : "badge-revoked"}>
                                {inst.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right space-x-2">
                              {inst.status !== "APPROVED" && (
                                <button onClick={() => updateInstStatus(inst.id, "APPROVED")} className="text-[10px] font-bold uppercase tracking-widest text-brand-valid hover:text-green-900 transition-colors bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                                  Approve
                                </button>
                              )}
                              {inst.status !== "SUSPENDED" && (
                                <button onClick={() => updateInstStatus(inst.id, "SUSPENDED")} className="text-[10px] font-bold uppercase tracking-widest text-yellow-700 hover:text-yellow-900 transition-colors bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                                  Suspend
                                </button>
                              )}
                              <button onClick={() => slashInstitution(inst.id, inst.name)} className="text-[10px] font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-colors bg-red-600 px-3 py-1.5 rounded-full border border-red-700 shadow-sm ml-2">
                                Slash Bond
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: PLAGIARISM */}
            {activeTab === "plagiarism" && (
              <motion.div key="plagiarism" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="mb-8">
                  <h1 className="font-display font-black text-4xl uppercase text-ink-900 mb-2">SimHash Plagiarism Reports</h1>
                  <p className="text-ink-600 font-medium max-w-2xl text-sm leading-relaxed uppercase tracking-widest">
                    Automatically detected anomalies in thesis submissions across the network using cryptographically derived fuzzy fingerprints.
                  </p>
                </div>

                <div className="grid gap-6">
                  {plagiarismReports.map(report => (
                    <div key={report.id} className="beanro-card p-6 border-l-4 border-l-brand-revoked flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="w-5 h-5 text-brand-revoked" />
                          <h3 className="font-display font-bold text-xl text-ink-900">{report.matchScore}% Match Detected</h3>
                        </div>
                        <p className="text-sm font-medium text-ink-700 mb-4">
                          <span className="font-bold">{report.studentName}</span> ({report.institutionName}) submitted a thesis highly similar to <span className="font-bold">{report.originalAuthor}'s</span> previous work.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-parchment-50 p-4 rounded-xl border border-parchment-200">
                          <div>
                            <span className="text-ink-500 uppercase font-sans font-bold tracking-widest block mb-1">Original SimHash</span>
                            {report.originalHash}
                          </div>
                          <div>
                            <span className="text-brand-revoked uppercase font-sans font-bold tracking-widest block mb-1">Flagged SimHash (1 bit diff)</span>
                            {report.simHash}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        <button className="btn-primary !bg-brand-revoked hover:!bg-red-800">
                          Revoke Credential
                        </button>
                        <button className="btn-secondary !bg-white">
                          Dismiss Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: AUDIT LOGS */}
            {activeTab === "logs" && (
              <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="beanro-card !p-0 overflow-hidden">
                  <div className="p-6 border-b border-parchment-200 flex items-center justify-between">
                    <h2 className="font-display font-bold text-2xl uppercase text-ink-900">System Audit Trail</h2>
                    <button onClick={() => fetchLogs()} className="p-2 text-ink-500 hover:text-bronze transition-colors rounded-full hover:bg-parchment-200">
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[10px] font-bold text-ink-500 uppercase tracking-widest border-b border-parchment-200 bg-parchment-50">
                          <th className="px-8 py-5">Time</th>
                          <th className="px-8 py-5">Action</th>
                          <th className="px-8 py-5">User</th>
                          <th className="px-8 py-5">IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-parchment-200 text-sm">
                        {logs.map((log) => (
                          <tr key={log.id} className="hover:bg-white transition-colors font-medium">
                            <td className="px-8 py-5 text-ink-500">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="px-8 py-5">
                              <span className="bg-parchment-100 text-ink-700 px-2 py-1 border border-parchment-300 rounded text-xs font-mono">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-ink-900">{log.userId ? log.user?.email : "System / Anonymous"}</td>
                            <td className="px-8 py-5 font-mono text-ink-500 text-xs">{log.ipAddress}</td>
                          </tr>
                        ))}
                        {logs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-8 py-12 text-center text-ink-500 font-medium uppercase tracking-widest text-xs">
                              No audit logs found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
