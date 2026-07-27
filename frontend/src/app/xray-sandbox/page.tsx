"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Play, Pause, Maximize, Scan } from "lucide-react";
import Link from "next/link";
import { featuresAPI } from "@/lib/api";

export default function XraySandboxPage() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await featuresAPI.getXRay();
        setRecords(data.records || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    let interval: any;
    if (playing) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const record = records[selectedIndex];
  const anomalies = record && record.anomalies ? JSON.parse(record.anomalies) : [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto p-6 pt-12">
        <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-8 transition">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Deepfake X-Ray Sandbox</h1>
          <p className="text-neutral-400">Explainable AI: See exactly why the heuristic engine flagged this media.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Mock Video Player */}
            <div className="relative aspect-video bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
              {/* Fake Video Content */}
              <div className="absolute inset-0 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40">
              </div>
              
              {/* X-Ray Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanner line */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-20"
                  style={{ left: `${progress}%` }}
                ></div>

                {/* Bounding Boxes (simulated based on progress) */}
                {anomalies.map((a: any, idx: number) => {
                  const isActive = progress > (a.timeSec * 2) && progress < (a.timeSec * 2 + 15);
                  if (!isActive) return null;
                  
                  return (
                    <div 
                      key={idx}
                      className="absolute border-2 border-red-500 bg-red-500/10 backdrop-blur-sm flex flex-col justify-end p-1 transition-all duration-300 z-10"
                      style={{
                        top: a.type === 'LIP_SYNC' ? '60%' : '30%',
                        left: '45%',
                        width: '10%',
                        height: '15%',
                      }}
                    >
                      <span className="text-[10px] font-bold text-red-500 bg-black/50 px-1 truncate">{a.type} ANOMALY</span>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <button onClick={() => setPlaying(!playing)} className="p-2 hover:bg-white/10 rounded-full transition">
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-full transition">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center text-red-400">
                <Scan className="w-4 h-4 mr-2" /> AI Telemetry Report
              </h3>
              
              {record ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-neutral-500 mb-1">Overall Confidence (Fake)</div>
                    <div className="text-3xl font-mono text-red-500">{record.confidence}%</div>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-neutral-800">
                    <div className="text-xs text-neutral-500 mb-2">Detected Anomalies</div>
                    {anomalies.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-black/50 p-3 rounded border border-neutral-800">
                        <span className="text-sm font-medium">{a.type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${a.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {a.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-neutral-500 animate-pulse">Loading telemetry...</div>
              )}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-neutral-300">Flagged Deepfakes Queue</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {records.map((r, i) => (
                  <button 
                    key={i}
                    onClick={() => { setSelectedIndex(i); setProgress(0); setPlaying(false); }}
                    className={`w-full text-left p-3 rounded-lg border transition ${i === selectedIndex ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-black border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
                  >
                    <div className="text-sm font-medium truncate mb-1">
                      {r.mediaUrl.split('/').pop().replace('_', ' ')}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Conf: {r.confidence}%</span>
                      <span className="text-red-500">{JSON.parse(r.anomalies).length} Anomalies</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
