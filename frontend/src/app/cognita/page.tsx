"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, Send, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { chatAPI } from "@/lib/api";

type Message = {
  role: "user" | "ai";
  content: string;
};

export default function CognitaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I am Cognita AI, the intelligent verification assistant for SatyaCheck. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatAPI.ask(userMessage);
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: response.reply || response.fallbackResponse || "Sorry, I received an empty response." 
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: error.message || "An error occurred while connecting to my brain." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 text-parchment-100 flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-bronze/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 h-20 flex items-center justify-between border-b border-white/5 relative z-10 bg-ink-950/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-parchment-400 hover:text-bronze transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to SatyaCheck</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bronze/20 text-bronze flex items-center justify-center border border-bronze/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="font-display font-black text-2xl tracking-wide uppercase text-white">
            Cognita <span className="text-bronze">AI</span>
          </h1>
        </div>
        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 relative z-10 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" 
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                    : "bg-bronze/20 text-bronze border border-bronze/30"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <BrainCircuit className="w-5 h-5" />}
                </div>
                
                <div className={`p-4 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-50 rounded-tr-sm" 
                    : "bg-white/5 border border-white/10 text-parchment-100 rounded-tl-sm"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-bronze/20 text-bronze flex items-center justify-center border border-bronze/30 shrink-0">
                <BrainCircuit className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-parchment-100 rounded-tl-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bronze animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-bronze animate-bounce" style={{ animationDelay: "0.2s" }} />
                <span className="w-2 h-2 rounded-full bg-bronze animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-6 bg-ink-950/80 backdrop-blur-xl border-t border-white/5 relative z-10">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about a suspicious call, message, or market claim..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-16 text-parchment-100 placeholder:text-parchment-500 focus:outline-none focus:ring-2 focus:ring-bronze/50 transition-all text-sm"
            disabled={loading}
          />
          <button type="submit" disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-bronze text-white rounded-full flex items-center justify-center hover:bg-bronze/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        <p className="text-center text-[10px] uppercase tracking-widest text-parchment-500 mt-3">
          Powered by Groq Llama-3 · Always verify with SEBI SCORES for critical decisions
        </p>
      </footer>
    </div>
  );
}
