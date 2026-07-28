"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Terminal = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "z-0 h-full max-w-lg w-full rounded-xl border border-white/10 bg-black/90 p-4 text-sm font-mono shadow-2xl relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4 opacity-50 relative z-10">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <div className="space-y-2 relative z-10 text-white/90">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              // @ts-ignore
              delay: index * 600 + (child.props.delay || 0),
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const TypingAnimation = ({
  children,
  className,
  delay = 0,
}: {
  children: string;
  className?: string;
  delay?: number;
}) => {
  const [text, setText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setText(children.substring(0, i + 1));
      i++;
      if (i >= children.length) clearInterval(interval);
    }, 30); // speed
    return () => clearInterval(interval);
  }, [children, started]);

  return (
    <div
      className={cn(className, "block transition-opacity duration-300 min-h-[1.25rem]", !started ? "opacity-0" : "opacity-100")}
    >
      {text}
    </div>
  );
};

export const AnimatedSpan = ({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return <div className="h-0 opacity-0 overflow-hidden" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(className, "block")}
    >
      {children}
    </motion.div>
  );
};
