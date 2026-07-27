"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Play, Pause, Maximize, Scan, ShieldAlert, CheckCircle, Activity, UploadCloud } from "lucide-react";
import Link from "next/link";
import { featuresAPI } from "@/lib/api";

export default function XraySandboxPage() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scanStatusText, setScanStatusText] = useState("Ready to scan");
  
  // Custom upload state
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customMediaUrl, setCustomMediaUrl] = useState<string | null>(null);
  const [customResult, setCustomResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Fake scanning animation logic for preloaded videos
  useEffect(() => {
    let interval: any;
    if (scanning && progress < 100 && !customFile) {
      interval = setInterval(() => {
        setProgress(p => {
          const next = p + 2;
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
  }, [scanning, progress, customFile]);

  const startScan = async () => {
    setProgress(0);
    setScanComplete(false);
    setScanning(true);
    setScanStatusText("Initializing X-Ray Engine...");
    
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    if (customFile) {
      // Real API Call
      try {
        setScanStatusText("Uploading media to Forensics Engine...");
        setProgress(20);
        
        const formData = new FormData();
        formData.append("file", customFile);
        
        setScanStatusText("Analyzing metadata & running deep learning models...");
        setProgress(60);
        
        const res = await featuresAPI.verifyMedia(formData);
        
        setProgress(100);
        setCustomResult(res);
        setScanComplete(true);
        setScanning(false);
        setScanStatusText("Analysis Complete");
      } catch (err) {
        console.error(err);
        setScanStatusText("Analysis failed. Try again.");
        setScanning(false);
      }
    }
  };

  const selectRecord = (index: number) => {
    setSelectedIndex(index);
    setCustomFile(null);
    setCustomMediaUrl(null);
    setCustomResult(null);
    setProgress(0);
    setScanning(false);
    setScanComplete(false);
    setScanStatusText("Ready to scan");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setCustomMediaUrl(URL.createObjectURL(file));
      setCustomResult(null);
      setProgress(0);
      setScanning(false);
      setScanComplete(false);
      setScanStatusText("Ready to scan custom media");
      // Deselect predefined record
      setSelectedIndex(-1);
    }
  };

  const isCustomMode = selectedIndex === -1 && customMediaUrl;
  const record = isCustomMode ? null : records[selectedIndex];
  
  let anomalies: any[] = [];
  let confidence = 0;
  let mediaUrlToPlay = "";
  let filenameDisplay = "";
  
  if (isCustomMode) {
    mediaUrlToPlay = customMediaUrl;
    filenameDisplay = customFile?.name || "Uploaded Media";
    confidence = customResult?.confidence || 0;
    
    if (customResult && customResult.manipulationIndicators) {
       anomalies = customResult.manipulationIndicators.map((ind: string) => ({
         type: ind, severity: "HIGH"
       }));
    }
  } else if (record) {
    const urlParts = record.mediaUrl.split("?name=");
    mediaUrlToPlay = urlParts[0];
    filenameDisplay = urlParts[1] ? urlParts[1].replace(/_/g, ' ') : mediaUrlToPlay.split('/').pop() || "";
    confidence = record.confidence;
    anomalies = record.anomalies ? JSON.parse(record.anomalies) : [];
  }

  const isVideo = mediaUrlToPlay?.toLowerCase().endsWith(".mp4") || mediaUrlToPlay?.toLowerCase().endsWith(".webm") || mediaUrlToPlay?.startsWith("blob:");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto p-6 pt-12">
        <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-8 transition">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Deepfake X-Ray Sandbox</h1>
            <p className="text-neutral-400">Explainable AI: Upload media or use demos to see why the engine flags it.</p>
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="video/*,image/*" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 px-4 py-2 rounded-lg font-medium transition"
            >
              <UploadCloud className="w-4 h-4" /> Custom Upload
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Media Player */}
            <div className="relative aspect-video bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
              
              {mediaUrlToPlay ? (
                isVideo ? (
                  <video 
                    ref={videoRef}
                    src={mediaUrlToPlay} 
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${scanning && !isCustomMode ? 'opacity-40' : 'opacity-100'}`}
                    controls={scanComplete || isCustomMode}
                    loop
                  />
                ) : (
                  <img 
                    src={mediaUrlToPlay} 
                    alt="Uploaded media"
                    className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-1000 ${scanning && !isCustomMode ? 'opacity-40' : 'opacity-100'}`}
                  />
                )
              ) : (
                <div className="text-neutral-500 flex flex-col items-center">
                  <Scan className="w-12 h-12 mb-2 opacity-50" />
                  Select a video or upload one
                </div>
              )}
              
              {/* X-Ray Overlay for Demo Mode */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Scanner line */}
                {(scanning || (scanComplete && !isCustomMode)) && (
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] z-20 transition-all ease-linear"
                    style={{ left: `${progress}%` }}
                  ></div>
                )}

                {/* Bounding Boxes (simulated based on progress) */}
                {scanComplete && !isCustomMode && anomalies.map((a: any, idx: number) => {
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
              {!scanning && !scanComplete && mediaUrlToPlay && (
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

              {/* Progress Bar (if not using native controls or if scanning) */}
              {scanning && (
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-mono text-blue-400">{Math.floor(progress)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 h-[320px] flex flex-col relative overflow-hidden">
              <h3 className="font-semibold mb-4 flex items-center text-red-400 z-10">
                <ShieldAlert className="w-5 h-5 mr-2" /> AI Telemetry Report
              </h3>
              
              {!mediaUrlToPlay ? (
                <div className="text-sm text-neutral-500 animate-pulse flex-1 flex items-center justify-center z-10">Waiting for media...</div>
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
                  <div className={`border rounded-lg p-4 ${confidence > 60 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <div className={`text-xs font-semibold mb-1 uppercase tracking-wider ${confidence > 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {confidence > 60 ? 'Deepfake Confidence' : 'Authenticity Confidence'}
                    </div>
                    <div className={`text-3xl font-mono font-bold ${confidence > 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {confidence > 60 ? confidence : 100 - confidence}%
                    </div>
                    <p className="text-xs text-neutral-300 mt-2">
                      {confidence > 60 
                        ? 'Warning: High probability of synthetic manipulation. Do not trust financial advice from this source.' 
                        : 'Media appears largely authentic or lacks strong signs of manipulation.'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mb-2">Detected Anomalies / Signals</div>
                    {anomalies.length > 0 ? anomalies.map((a: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-black/60 p-3 rounded-md border border-neutral-800">
                        <span className="text-xs font-medium text-neutral-200">{a.type.replace(/_/g, ' ')}</span>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-sm bg-red-500/20 text-red-400`}>
                          {a.severity || "DETECTED"}
                        </span>
                      </div>
                    )) : (
                      <div className="text-xs text-neutral-400 italic">No significant anomalies detected.</div>
                    )}
                    
                    {isCustomMode && customResult?.metadataFlags?.map((flag: string, i: number) => (
                      <div key={`meta-${i}`} className="flex justify-between items-center bg-black/60 p-3 rounded-md border border-neutral-800 mt-2">
                         <span className="text-xs font-medium text-neutral-200">{flag}</span>
                         <span className="text-[10px] font-bold px-2 py-1 rounded-sm bg-orange-500/20 text-orange-400">METADATA</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-neutral-300">Flagged Deepfakes Queue</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {records.length > 0 ? records.map((r, i) => {
                  const urlParts = r.mediaUrl.split("?name=");
                  const fname = urlParts[1] ? urlParts[1].replace(/_/g, ' ').replace('.mp4', '') : "Demo Video";
                  
                  return (
                    <button 
                      key={i}
                      onClick={() => selectRecord(i)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${i === selectedIndex && !isCustomMode ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'bg-black border-neutral-800 hover:border-neutral-600'}`}
                    >
                      <div className={`text-sm font-semibold truncate mb-1.5 ${i === selectedIndex && !isCustomMode ? 'text-blue-400' : 'text-neutral-300'}`}>
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
