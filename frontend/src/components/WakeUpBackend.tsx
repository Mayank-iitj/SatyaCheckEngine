"use client";

import { useEffect } from "react";

export default function WakeUpBackend() {
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    const getHealthUrl = () => {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://satyacheck-backend.onrender.com/api" : "http://localhost:4000/api")).replace(/\/$/, "");
      return `${baseUrl}/health`;
    };

    const pingServer = async (attempt = 1): Promise<void> => {
      if (!isMounted) return;
      const url = getHealthUrl();
      try {
        if (attempt === 1) {
          console.log("⚡ [SatyaCheck] Auto-spinning up backend server...");
        }
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          mode: "cors",
        });
        if (res.ok) {
          console.log("✅ [SatyaCheck] Backend is warm and ready!");
          return;
        }
        throw new Error(`Status ${res.status}`);
      } catch (e) {
        if (attempt < 5 && isMounted) {
          console.warn(`⏳ [SatyaCheck] Backend cold-start in progress (attempt ${attempt}/5). Retrying...`);
          // Exponential backoff: 3s, 5s, 8s, 12s
          const delay = Math.min(3000 * attempt, 12000);
          setTimeout(() => pingServer(attempt + 1), delay);
        }
      }
    };

    // Initial wakeup ping
    pingServer();

    // Keep-alive interval every 3 minutes (180,000 ms) so Render free-tier never sleeps while a user is browsing
    timer = setInterval(() => {
      if (isMounted) {
        pingServer(1);
      }
    }, 180000);

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, []);

  return null;
}

