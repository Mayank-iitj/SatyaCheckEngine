"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Play, Pause, Maximize, Scan, ShieldAlert, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";
import { featuresAPI } from "@/lib/api";

const IMAGE_MAP: Record<string, string> = {
  "nse_ceo_advisory.mp4": "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80",
  "hdfc_chairman_fake.mp4": "https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80",
  "adani_statement_fake.mp4": "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80",
  "sebi_chairperson_deepfake.mp4": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80",
  "rbi_governor_clone.mp4": "https://images.unsplash.com/photo-1507679622767-deb19fb7df2c?auto=format&fit=crop&q=80",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80";

export default function XraySandboxPage() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scanStatusText, setScanStatusText] = useState("Ready to scan");
  
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
    if (scanning && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => {
          const next = p + 1.5;
          if (next >= 100) {
            setScanning(false);
            setScanComplete(true);
            setScanStatusText("Analysis Complete");
            return 100;
          }
          
          if (next < 30) setScanStatusText("Analyzing facial landmarks...");
          else if (next < 60) setScanStatusText("Checking lip-sync consistency...");
          else if (next < 90) setScanStatusText("Running audio frequency forensics...");
          
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [scanning, progress]);

  const startScan = () => {
    setProgress(0);
    setScanComplete(false);
    setScanning(true);
    setScanStatusText("Initializing X-Ray Engine...");
  };

  const selectRecord = (index: number) => {
    setSelectedIndex(index);
    setProgress(0);
    setScanning(false);
    setScanComplete(false);
    setScanStatusText("Ready to scan");
  };

  const record = records[selectedIndex];
  const anomalies = record && record.anomalies ? JSON.parse(record.anomalies) : [];
  
  const filename = record ? record.mediaUrl.split('/').pop() : "";
  const bgImage = IMAGE_MAP[filename] || DEFAULT_IMAGE;

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
              
              {/* Video Content */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${scanning || scanComplete ? 'opacity-40' : 'opacity-100'}`}
                style={{ backgroundImage: `url('${bgImage}')` }}
              ></div>
              
              {/* X-Ray Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanner line */}
                {(scanning || scanComplete) && (
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-20 transition-all ease-linear"
                    style={{ left: `${progress}%` }}
                  ></div>
                )}

                {/* Bounding Boxes (simulated based on progress) */}
                {scanComplete && anomalies.map((a: any, idx: number) => {
                  return (
                    <div 
                      key={idx}
                      className="absolute border-2 border-red-500 bg-red-500/10 backdrop-blur-sm flex flex-col justify-end p-1 transition-all duration-500 z-10 animate-pulse"
                      style={{
                        top: a.type === 'LIP_SYNC' || a.type === 'VOICE_CLONING_ARTIFACTS' ? '55%' : '25%',
                        left: '42%',
                        width: '15%',
                        height: '20%',
                      }}
                    >
                      <span className="text-[10px] font-bold text-white bg-red-600 px-1 truncate shadow-lg">{a.type.replace(/_/g, ' ')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Central Play/Scan Button */}
              {!scanning && !scanComplete && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <button 
                    onClick={startScan}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  >
                    <Scan className="w-5 h-5" />
                    <span>Run X-Ray Analysis</span>
                  </button>
                </div>
              )}

              {/* Status Overlay */}
              {(scanning || scanComplete) && (
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur px-4 py-2 rounded-lg border border-neutral-700 flex items-center space-x-3">
                  {scanning ? (
                    <Activity className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm font-medium tracking-wide">{scanStatusText}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="text-xs font-mono text-blue-400">{Math.floor(progress)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-[320px] flex flex-col relative overflow-hidden">
              <h3 className="font-semibold mb-4 flex items-center text-red-400 z-10">
                <ShieldAlert className="w-5 h-5 mr-2" /> AI Telemetry Report
              </h3>
              
              {!record ? (
                <div className="text-sm text-neutral-500 animate-pulse flex-1 flex items-center justify-center z-10">Connecting to engine...</div>
              ) : !scanComplete ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 z-10">
                  <div className={`p-4 rounded-full ${scanning ? 'bg-blue-500/10 text-blue-500 animate-pulse' : 'bg-neutral-800 text-neutral-500'}`}>
                    <Scan className="w-8 h-8" />
                  </div>
                  <div className="text-sm text-neutral-400">
                    {scanning ? 'Engine is actively analyzing media tensors...' : 'Click "Run X-Ray" to generate the forensic report.'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="text-xs text-red-400 font-semibold mb-1 uppercase tracking-wider">Deepfake Confidence</div>
                    <div className="text-3xl font-mono text-red-500 font-bold">{record.confidence}%</div>
                    <p className="text-xs text-neutral-300 mt-2">
                      Warning: High probability of synthetic manipulation. Do not trust financial advice from this source.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-2">Detected Anomalies</div>
                    {anomalies.length > 0 ? anomalies.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-black/60 p-3 rounded-md border border-neutral-800">
                        <span className="text-xs font-medium text-neutral-200">{a.type.replace(/_/g, ' ')}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-sm ${a.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {a.severity}
                        </span>
                      </div>
                    )) : (
                      <div className="text-xs text-neutral-400 italic">No anomalies detected.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-neutral-300">Flagged Deepfakes Queue</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {records.length > 0 ? records.map((r, i) => {
                  const fname = r.mediaUrl.split('/').pop().replace('.mp4', '').replace(/_/g, ' ');
                  return (
                    <button 
                      key={i}
                      onClick={() => selectRecord(i)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${i === selectedIndex ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-black border-neutral-800 hover:border-neutral-600'}`}
                    >
                      <div className={`text-sm font-semibold truncate mb-1.5 ${i === selectedIndex ? 'text-blue-400' : 'text-neutral-300'}`}>
                        {fname.toUpperCase()}
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-500">Conf: <span className="text-red-400 font-mono">{r.confidence}%</span></span>
                        <span className="bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">{JSON.parse(r.anomalies).length} Flags</span>
                      </div>
                    </button>
                  );
                }) : (
                  <div className="text-sm text-neutral-500 italic p-4 text-center">No deepfakes in queue.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
