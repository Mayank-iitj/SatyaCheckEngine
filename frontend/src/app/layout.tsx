import {ClerkProvider} from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SatyaCheck — Protect. Verify. Trust.",
  description:
    "SatyaCheck is India's AI-powered market integrity platform. Detect financial scams, deepfakes, phishing, and vishing targeting retail investors using four specialized verification engines.",
  keywords: [
    "market integrity",
    "financial scam detection",
    "deepfake detector",
    "SEBI verification",
    "investor protection India",
    "SatyaCheck",
    "phishing detection",
    "vishing detector",
  ],
};


import { Toaster } from 'sonner';

import WakeUpBackend from "@/components/WakeUpBackend";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <ClerkProvider>
          <Toaster position="top-right" richColors closeButton />
          <WakeUpBackend />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}