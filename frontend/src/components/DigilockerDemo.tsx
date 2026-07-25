import { motion } from "framer-motion";
import { ShieldCheck, ArrowRightLeft, FileCheck, Building2, UserCircle } from "lucide-react";
import { DigiLockerBadge } from "./DigiLockerBadge";

export default function DigilockerDemo() {
  return (
    <section className="py-24 px-6 relative z-10 bg-white border-y border-parchment-200 overflow-hidden">
      <div className="max-w-[90rem] mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Content */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Government Identity Gateway</span>
          </div>
          
          <h2 className="font-display font-black text-5xl md:text-6xl uppercase leading-[0.9] text-ink-900">
            Native <span className="text-blue-600">DigiLocker</span> <br /> Integration
          </h2>

          <p className="text-ink-600 font-medium leading-relaxed max-w-xl text-lg mt-4">
            ProofMind connects directly to state-backed identity infrastructure. By seamlessly integrating with DigiLocker, we cryptographically bind academic credentials to verified national identities, creating an unbreakable chain of trust from the government to the university.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-parchment-50 border border-parchment-200 flex items-center justify-center flex-shrink-0 shadow-sm text-blue-600">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-ink-900 uppercase tracking-wide text-sm mb-1">Instant Sync</h4>
                <p className="text-xs font-medium text-ink-500 leading-relaxed">Pull existing attested records directly into the ProofMind wallet.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-parchment-50 border border-parchment-200 flex items-center justify-center flex-shrink-0 shadow-sm text-blue-600">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-ink-900 uppercase tracking-wide text-sm mb-1">Push to Locker</h4>
                <p className="text-xs font-medium text-ink-500 leading-relaxed">Newly minted blockchain credentials can be pushed back to DigiLocker.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Mock */}
        <div className="relative w-full aspect-square md:aspect-video lg:aspect-square flex items-center justify-center">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-blue-50/50 rounded-full blur-[100px]" />
          
          <div className="relative z-10 w-full max-w-md bg-parchment-50 rounded-3xl border border-parchment-200 p-8 shadow-2xl flex flex-col items-center">
            
            {/* Top Node: DigiLocker */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-4 rounded-2xl border border-blue-200 shadow-sm flex items-center gap-4 w-full"
            >
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-ink-900 text-sm">DigiLocker Server</h4>
                <p className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">Government Gateway</p>
              </div>
            </motion.div>

            {/* Connecting Animation */}
            <div className="h-16 w-px bg-parchment-300 relative my-2">
              <motion.div 
                animate={{ y: [0, 64] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              />
            </div>

            {/* Center Node: Processing */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="w-full bg-ink-900 text-white p-4 rounded-2xl shadow-lg border border-ink-800 relative z-20"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-parchment-400">Secure Transfer</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-2 font-mono text-xs text-emerald-400">
                <div>&gt; Authenticating OAuth...</div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }}>&gt; Fetching UID Data...</motion.div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1.0 }}>&gt; Anchoring Hash: 0x8F2...</motion.div>
              </div>
            </motion.div>

            {/* Connecting Animation */}
            <div className="h-16 w-px bg-parchment-300 relative my-2">
              <motion.div 
                animate={{ y: [0, 64] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-bronze rounded-full shadow-[0_0_10px_rgba(201,151,87,0.8)]"
              />
            </div>

            {/* Bottom Node: ProofMind Wallet */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-4 rounded-2xl border border-bronze/30 shadow-sm flex items-center justify-between gap-4 w-full"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bronze/10 text-bronze rounded-full flex items-center justify-center border border-bronze/20">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-ink-900 text-sm">Student Wallet</h4>
                  <p className="text-[10px] uppercase tracking-widest text-ink-500 font-bold">ProofMind App</p>
                </div>
              </div>
              <DigiLockerBadge size="sm" />
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
