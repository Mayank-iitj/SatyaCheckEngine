"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface ComicTextProps {
  children: string;
  className?: string;
  fontSize?: number;
}

export function ComicText({ children, className, fontSize = 4 }: ComicTextProps) {
  return (
    <motion.div
      className={cn("inline-block font-black uppercase transform-gpu cursor-default", className)}
      style={{ fontSize: `${fontSize}rem`, lineHeight: 1 }}
      whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }}
      animate={{
        rotate: [0, -2, 2, -1, 0],
        scale: [1, 1.05, 1, 1.02, 1],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative inline-block">
        {/* Shadow / Border Layer */}
        <span
          className="absolute inset-0 text-black z-0"
          style={{
            WebkitTextStroke: "6px black",
            textShadow: "4px 6px 0 black",
          }}
          aria-hidden="true"
        >
          {children}
        </span>
        
        {/* Colored Front Layer */}
        <span
          className="relative z-10"
          style={{
            color: "#facc15", // yellow-400
            WebkitTextStroke: "2px #ef4444", // red-500
          }}
        >
          {children}
        </span>
      </div>
    </motion.div>
  );
}
