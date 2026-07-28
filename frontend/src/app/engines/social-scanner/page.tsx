"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scannerAPI } from "@/lib/api";
import { 
  Activity, AlertTriangle, CheckCircle, ShieldAlert, 
  Search, RefreshCw, Filter, Zap, Globe, MessageSquare, Twitter, Disc, MessageCircle 
} from "lucide-react";

interface ThreatAlert {
  id: string;
  timestamp: string;
  platform: string;
  content: string;
  estimatedReach: number;
  threatType: string;
  severity: string;
  confidenceScore: string;
}

interface ScannerStatus {
  lastRun: string;
  isScanningNow: boolean;
  activeThreats: ThreatAlert[];
  scannedCount?: number;
}

export default function SocialScannerPage() {
  const [status, setStatus] = useState<ScannerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterPlatform, setFilterPlatform] = useState<string>("ALL");

  const fetchStatus = useCallback(async () => {
    try {
      const data = await scannerAPI.status();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch scanner status", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleManualScan = async () => {
    setRefreshing(true);
    try {
      await scannerAPI.run();
      await fetchStatus();
    } catch (err) {
      console.error(err);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="flex flex-col items-center gap-4 relative z-10">
           <RefreshCw className="animate-spin text-blue-500 w-12 h-12" />
           <p className="font-mono text-blue-400 tracking-widest text-sm uppercase">Initializing SatyaCheck Nexus...</p>
        </div>
      </div>
    );
  }

  // Derived stats
  const activeThreats = status?.activeThreats || [];
  const filteredThreats = activeThreats.filter(t => 
    (filterSeverity === "ALL" || t.severity === filterSeverity) &&
    (filterPlatform === "ALL" || t.platform === filterPlatform)
  );

  const criticalCount = activeThreats.filter(t => t.severity === "CRITICAL").length;
  const highCount = activeThreats.filter(t => t.severity === "HIGH").length;

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case "CRITICAL": return "text-red-500 bg-red-500/10 border-red-500/30";
      case "HIGH": return "text-orange-500 bg-orange-500/10 border-orange-500/30";
      case "MEDIUM": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      default: return "text-green-500 bg-green-500/10 border-green-500/30";
    }
  };

  const getPlatformIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("x") || p.includes("twitter")) return <Twitter className="w-4 h-4" />;
    if (p.includes("discord")) return <Disc className="w-4 h-4" />;
    if (p.includes("telegram")) return <MessageSquare className="w-4 h-4" />;
    if (p.includes("whatsapp")) return <MessageCircle className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 p-6 md:p-10 font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="max-w-[90rem] mx-auto relative z-10 space-y-8">
        
        {/* Header Area */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Activity className="text-blue-400 w-5 h-5" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase font-display">
                Social <span className="text-blue-500">Scanner</span>
              </h1>
            </div>
            <p className="text-gray-400 max-w-2xl font-mono text-sm leading-relaxed mt-4">
              Real-time deep learning engine monitoring global social networks, dark web forums, and encrypted groups for coordinated pump-and-dump schemes and vishing campaigns.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/10 font-mono text-xs">
              <div className={`w-2 h-2 rounded-full ${status?.isScanningNow ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
              <span className="text-gray-300">
                {status?.isScanningNow ? "SCANNING NETWORK..." : "ENGINE ONLINE"}
              </span>
            </div>
            
            <button 
              onClick={handleManualScan}
              disabled={refreshing || status?.isScanningNow}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] text-sm uppercase tracking-wider"
            >
              <Zap className={`w-4 h-4 ${refreshing || status?.isScanningNow ? 'animate-pulse text-yellow-400' : ''}`} />
              {(refreshing || status?.isScanningNow) ? "Running..." : "Manual Scan"}
            </button>
          </div>
        </div>

        {/* Intelligence HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors"></div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">Total Monitored</h3>
            <p className="text-4xl font-black text-white mt-2">500K+</p>
            <p className="text-xs text-blue-400 mt-2 font-mono flex items-center gap-1">
               <CheckCircle className="w-3 h-3" /> updated 30s ago
            </p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-red-500/20 transition-colors"></div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">Critical Threats</h3>
            <p className="text-4xl font-black text-red-500 mt-2">{criticalCount}</p>
            <p className="text-xs text-red-400 mt-2 font-mono flex items-center gap-1">
               <ShieldAlert className="w-3 h-3" /> immediate action req
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-colors"></div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">High Risk</h3>
            <p className="text-4xl font-black text-orange-400 mt-2">{highCount}</p>
            <p className="text-xs text-orange-400 mt-2 font-mono flex items-center gap-1">
               <AlertTriangle className="w-3 h-3" /> escalating rapidly
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors"></div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">Last Engine Run</h3>
            <p className="text-lg font-medium text-white mt-3 font-mono">
              {status?.lastRun ? new Date(status.lastRun).toLocaleTimeString() : "Never"}
            </p>
            <p className="text-xs text-purple-400 mt-2 font-mono flex items-center gap-1">
               <RefreshCw className="w-3 h-3" /> auto-cycle enabled
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/[0.02] border border-white/5 p-4 rounded-xl backdrop-blur-sm gap-4">
           <div className="flex items-center gap-3">
             <Filter className="w-4 h-4 text-gray-400" />
             <span className="text-sm font-mono text-gray-400 uppercase">Filters:</span>
             
             <select 
               className="bg-black/50 border border-white/10 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
               value={filterSeverity}
               onChange={(e) => setFilterSeverity(e.target.value)}
             >
               <option value="ALL">All Severities</option>
               <option value="CRITICAL">Critical Only</option>
               <option value="HIGH">High Only</option>
               <option value="MEDIUM">Medium Only</option>
             </select>

             <select 
               className="bg-black/50 border border-white/10 text-white text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono"
               value={filterPlatform}
               onChange={(e) => setFilterPlatform(e.target.value)}
             >
               <option value="ALL">All Platforms</option>
               <option value="X">X (Twitter)</option>
               <option value="Telegram">Telegram</option>
               <option value="WhatsApp Group">WhatsApp</option>
               <option value="Discord">Discord</option>
               <option value="Reddit">Reddit</option>
             </select>
           </div>
           
           <div className="text-sm font-mono text-gray-500 flex items-center gap-2">
             <Search className="w-4 h-4" />
             Showing {filteredThreats.length} of {activeThreats.length} intercepts
           </div>
        </div>

        {/* Feed Grid */}
        {filteredThreats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white/[0.01] border border-white/5 rounded-2xl border-dashed">
            <CheckCircle className="w-16 h-16 text-gray-700 mb-4" />
            <p className="text-gray-500 font-mono">No intercepts match current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredThreats.map((alert, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 < 1 ? index * 0.05 : 0 }}
                  key={alert.id} 
                  className={`bg-[#0a0a0a] border border-white/5 rounded-xl p-6 shadow-2xl relative group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-between`}
                >
                  {/* Decorative corner glow based on severity */}
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-20 -mr-16 -mt-16 pointer-events-none transition-opacity group-hover:opacity-40 ${
                    alert.severity === 'CRITICAL' ? 'bg-red-500' : 
                    alert.severity === 'HIGH' ? 'bg-orange-500' : 
                    alert.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-widest font-mono border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity} RISK
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium bg-white/5 px-2.5 py-1 rounded-sm w-max border border-white/5">
                          {getPlatformIcon(alert.platform)} {alert.platform}
                        </div>
                      </div>
                      <span className="text-gray-600 text-xs font-mono tabular-nums">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-gray-200 text-sm md:text-base leading-relaxed mb-6 font-medium">
                      "{alert.content}"
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 uppercase text-[9px] tracking-widest">Classification</span>
                        <span className="text-gray-300">{alert.threatType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-right">
                        <span className="text-gray-500 uppercase text-[9px] tracking-widest">Est. Reach / Conf.</span>
                        <span className="text-gray-300">{alert.estimatedReach.toLocaleString()} users <span className="text-blue-500">•</span> {alert.confidenceScore}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
