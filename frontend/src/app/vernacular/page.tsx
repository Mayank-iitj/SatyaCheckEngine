"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Mic, MicOff, PhoneCall, PhoneOff, Languages, Volume2 } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { featuresAPI } from "@/lib/api";

export default function VernacularPage() {
  const [callActive, setCallActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Audio wave animation
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 20, 20, 20, 20]);

  useEffect(() => {
    let interval: any;
    if (callActive) {
      interval = setInterval(() => {
        setWaveHeights(Array.from({length: 5}, () => 20 + Math.random() * 40));
      }, 150);
    } else {
      setWaveHeights([20, 20, 20, 20, 20]);
    }
    return () => clearInterval(interval);
  }, [callActive]);

  const simulateCall = async () => {
    setCallActive(true);
    setResult(null);
    
    // Wait a few seconds then "intercept" the call
    setTimeout(() => {
      setAnalyzing(true);
      
      setTimeout(async () => {
        try {
          const data = await featuresAPI.checkVernacular({ audioBuffer: "mock_audio_stream" });
          setResult(data);
        } catch (err) {
          console.error(err);
        } finally {
          setAnalyzing(false);
          setCallActive(false); // Call dropped
        }
      }, 2000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans">
      <div className="max-w-4xl mx-auto p-6 pt-12">
        <Link href="/" className="inline-flex items-center text-orange-400 hover:text-orange-300 mb-8 transition">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-3 flex items-center text-orange-500">
            <Languages className="w-8 h-8 mr-3" /> Vernacular Scam Interceptor
          </h1>
          <p className="text-stone-400">Protecting rural India by analyzing regional language calls in real-time and playing localized warnings.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mobile Phone Mockup */}
          <div className="flex justify-center">
            <div className="w-[300px] h-[600px] bg-black border-4 border-stone-800 rounded-[3rem] p-4 relative shadow-2xl flex flex-col">
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-stone-800 rounded-b-3xl mx-20"></div>
              
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 mt-12">
                <div className="text-center">
                  <div className="text-stone-400 mb-1">Incoming Call...</div>
                  <div className="text-2xl font-semibold">+91 98765 43210</div>
                  <div className="text-sm text-red-400 mt-1">Suspected Spam</div>
                </div>

                <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center relative overflow-hidden">
                  {callActive ? (
                    <div className="flex items-center space-x-1 absolute bottom-4">
                      {waveHeights.map((h, i) => (
                        <div key={i} className="w-1 bg-green-500 rounded-full transition-all duration-150" style={{ height: `${h}px` }}></div>
                      ))}
                    </div>
                  ) : (
                    <PhoneCall className="w-10 h-10 text-stone-500" />
                  )}
                </div>

                {!callActive && !result && (
                  <button onClick={simulateCall} className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:bg-green-400 transition">
                    <PhoneCall className="w-8 h-8 text-white" />
                  </button>
                )}

                {callActive && (
                  <div className="flex space-x-4">
                    <button className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center">
                      <MicOff className="w-6 h-6 text-stone-400" />
                    </button>
                    <button onClick={() => setCallActive(false)} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                      <PhoneOff className="w-6 h-6 text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* SatyaCheck Overlay */}
              {(analyzing || result) && (
                <div className="absolute bottom-10 left-4 right-4 bg-stone-900 border border-stone-700 rounded-2xl p-4 shadow-xl shadow-black">
                  {analyzing ? (
                    <div className="flex items-center space-x-3 text-orange-400">
                      <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">SatyaCheck analyzing audio...</span>
                    </div>
                  ) : result ? (
                    <div className="space-y-3">
                      <div className="flex items-center text-red-500 font-bold text-sm">
                        <ShieldX className="w-4 h-4 mr-1" /> SCAM DETECTED
                      </div>
                      <div className="text-xs text-stone-400 italic">"{result.translation}"</div>
                      <div className="bg-red-500/20 text-red-400 p-2 rounded text-xs flex items-center">
                        <Volume2 className="w-4 h-4 mr-2" /> Playing Marathi Warning...
                      </div>
                      <div className="text-xs text-center text-stone-500 mt-2 border-t border-stone-800 pt-2">
                        Call Auto-Disconnected
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 text-orange-400">Under the Hood</h3>
              <ul className="space-y-4 text-sm text-stone-400">
                <li className="flex items-start">
                  <span className="bg-stone-800 text-stone-300 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">1</span>
                  <span>Audio chunks are streamed to the backend in real-time.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-stone-800 text-stone-300 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">2</span>
                  <span><strong>Bhashini API (Mocked)</strong> translates regional languages (Marathi, Hindi) to English intent.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-stone-800 text-stone-300 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">3</span>
                  <span>If heuristic engine detects "guaranteed returns" or urgency, it scores the intent.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-stone-800 text-stone-300 rounded-full w-6 h-6 flex items-center justify-center mr-3 shrink-0">4</span>
                  <span>App intercepts the audio channel, plays a warning in the native language, and optionally drops the call.</span>
                </li>
              </ul>
            </div>

            {/* Recent Intercepts Log */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 mt-6">
              <h3 className="text-xl font-bold mb-4 text-stone-200">Recent Intercepts Log</h3>
              <div className="space-y-3">
                {[
                  { lang: "Marathi", intent: "Guaranteed Returns", score: "99%", action: "Call Dropped", date: "10m ago" },
                  { lang: "Hindi", intent: "Urgent Margin Call", score: "95%", action: "Warning Played", date: "42m ago" },
                  { lang: "Gujarati", intent: "Unlisted Shares Offer", score: "91%", action: "Call Dropped", date: "1h ago" },
                  { lang: "Tamil", intent: "Fake IPO Allotment", score: "97%", action: "Warning Played", date: "3h ago" },
                  { lang: "Bengali", intent: "Account Blocked Threat", score: "98%", action: "Call Dropped", date: "5h ago" }
                ].map((log, idx) => (
                  <div key={idx} className="bg-black p-3 rounded-lg border border-stone-800 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-semibold text-stone-300">{log.intent}</div>
                      <div className="text-xs text-stone-500 mt-0.5">{log.lang} | Confidence: {log.score}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${log.action === 'Call Dropped' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {log.action}
                      </span>
                      <div className="text-[10px] text-stone-600 mt-1">{log.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Adding missing import above
import { ShieldX } from "lucide-react";
