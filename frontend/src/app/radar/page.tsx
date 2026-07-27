"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Radar, AlertTriangle, ShieldX } from "lucide-react";
import Link from "next/link";
import { featuresAPI } from "@/lib/api";

export default function CloneRadarPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const data = await featuresAPI.getCloneRadar();
        setDomains(data.domains || []);
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchDomains();
    
    // Simulate continuous scanning
    const interval = setInterval(() => {
      setScanning(s => !s);
      setTimeout(() => setScanning(s => !s), 1000);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-5xl mx-auto p-6 pt-12">
        <Link href="/" className="inline-flex items-center text-indigo-400 hover:text-indigo-300 mb-8 transition">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Radar className={`w-8 h-8 mr-3 text-indigo-500 ${scanning ? 'animate-spin' : ''}`} />
              Proactive Typo-squatting Radar
            </h1>
            <p className="text-slate-400">Continuous monitoring of global domain registries for SEBI broker clones.</p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-400">Scanner Active</span>
          </div>
        </div>

        <div className="grid gap-4">
          {domains.map((d, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:border-slate-700 transition">
              <div className="flex items-center space-x-6">
                <div className={`p-3 rounded-full ${d.status === 'BLOCKED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {d.status === 'BLOCKED' ? <ShieldX className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono text-white tracking-wider">{d.domain}</h3>
                  <p className="text-sm text-slate-400 mt-1">Targeting: <span className="font-semibold text-slate-200">{d.targetBroker}</span></p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 uppercase font-semibold">Similarity</span>
                  <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${d.similarityScore}%` }}></div>
                  </div>
                  <span className="text-sm font-mono">{d.similarityScore}%</span>
                </div>
                
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${d.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20 animate-pulse'}`}>
                  {d.status === 'BLOCKED' ? 'BLOCKED AT DNS LEVEL' : 'NEW THREAT DETECTED'}
                </span>
              </div>
            </div>
          ))}

          {domains.length === 0 && (
            <div className="text-center py-12 text-slate-500">Loading radar data...</div>
          )}
        </div>
      </div>
    </div>
  );
}
