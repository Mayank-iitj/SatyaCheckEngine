"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface DiaTextRevealProps {
  text: string;
  className?: string;
  colors?: string[];
}

export function DiaTextReveal({
  text,
  className,
  colors = ["#A97CF8", "#F38CB8", "#FDCC92"],
}: DiaTextRevealProps) {
  return (
    <div className={cn("relative inline-block overflow-hidden", className)}>
      <span className="opacity-40">{text}</span>
      <motion.span
        className="absolute inset-0 bg-clip-text text-transparent bg-[length:250%_auto]"
        style={{
          backgroundImage: `linear-gradient(110deg, transparent 0%, transparent 20%, ${colors[0]} 40%, ${colors[1]} 50%, ${colors[2]} 60%, transparent 80%, transparent 100%)`,
        }}
        animate={{
          backgroundPosition: ["250% center", "-250% center"],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {text}
      </motion.span>
    </div>
  );
}
