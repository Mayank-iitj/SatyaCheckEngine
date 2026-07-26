"use client";

import { useEffect } from "react";

export default function WakeUpBackend() {
  useEffect(() => {
    const wakeup = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        // Ping the health route to spin up the Render free tier instance
        await fetch(`${url}/health`);
      } catch (e) {
        // Silent fail, it's just a background wakeup ping
      }
    };
    wakeup();
  }, []);

  return null;
}
