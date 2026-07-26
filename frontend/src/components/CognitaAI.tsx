import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, ScanSearch, CheckCircle2 } from "lucide-react";
import RotatingText from "./RotatingText";
import Link from "next/link";

export default function CognitaAI() {
  return (
    <section id="ai" className="py-24 px-6 relative z-10 overflow-hidden bg-parchment-50 border-t border-parchment-200">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-bronze/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-[90rem] mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side: Content */}
        <div className="flex flex-col gap-6">

          
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase leading-[0.9] text-ink-900">
            Meet <span className="text-bronze">Cognita AI</span>
          </h2>
          
          <div className="font-display font-bold text-2xl md:text-3xl text-ink-700 flex items-center gap-2 uppercase">
            Intelligent
            {(() => {
              const AnyRotatingText = RotatingText as any;
              return (
                <AnyRotatingText 
                  texts={['Verification', 'Cross-referencing', 'Analysis', 'Insights']}
                  mainClassName="bg-bronze text-white px-3 py-1 rounded-lg overflow-hidden ml-2"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              );
            })()}
          </div>

          <p className="text-ink-600 font-medium leading-relaxed max-w-xl text-lg mt-4">
            Cognita AI leverages the power of PyTorch deepfake detection and LLM-driven reasoning. 
            It doesn't just check for keywords — it cross-references every market-moving claim against 
            official exchange filings and the SEBI intermediary registry to flag scams instantly.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-white border border-parchment-200 flex items-center justify-center flex-shrink-0 shadow-sm text-bronze">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-ink-900 uppercase tracking-wide text-sm mb-1">Claim Verification</h4>
                <p className="text-xs font-medium text-ink-500 leading-relaxed">Cross-references claims against SEBI filings in real time.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-white border border-parchment-200 flex items-center justify-center flex-shrink-0 shadow-sm text-bronze">
                <ScanSearch className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-ink-900 uppercase tracking-wide text-sm mb-1">Multi-Threat Net</h4>
                <p className="text-xs font-medium text-ink-500 leading-relaxed">Detects LLM phishing, deepfake video, and synthetic voice.</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link href="/cognita" className="btn-primary inline-flex items-center gap-2">
              Chat with Cognita AI <BrainCircuit className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Side: Visual/Card */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full aspect-square md:aspect-video lg:aspect-square bg-white rounded-3xl border border-parchment-200 p-8 shadow-xl flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-bronze/5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <h3 className="font-display font-bold text-xl uppercase text-ink-900">Live AI Analysis</h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-ink-400">Processing</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 relative z-10 flex-1">
            {/* Mock Analysis Steps */}
            {[
              "Extracting claims from unverified text...",
              "Querying SEBI registered-entity registry...",
              "Cross-referencing latest NSE corporate filings...",
              "Calculating multi-model risk score..."
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + (idx * 0.4), duration: 0.5 }}
                className="flex items-center gap-3 bg-parchment-50 p-3 rounded-lg border border-parchment-200"
              >
                <CheckCircle2 className="w-4 h-4 text-bronze flex-shrink-0" />
                <span className="text-sm font-medium text-ink-700 font-mono">{step}</span>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="mt-6 bg-red-600 text-white p-4 rounded-xl flex items-center justify-between relative z-10 shadow-lg"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Final Verdict</div>
              <div className="font-display font-bold text-xl uppercase">High Risk</div>
            </div>
            <div className="text-xl font-display font-black text-right leading-tight uppercase">Fake<br/>Buyback</div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
