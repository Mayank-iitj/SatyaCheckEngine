import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProofMind — Trust Every Degree. Verify Every Achievement.",
  description:
    "Blockchain-backed academic credential verification platform. Universities issue tamper-proof digital credentials, students store them in a digital wallet, and employers verify authenticity in seconds.",
  keywords: [
    "academic credentials",
    "blockchain verification",
    "digital degree",
    "credential verification",
    "ProofMind",
    "education technology",
  ],
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <Toaster position="top-right" richColors closeButton />
        {children}
      </body>
    </html>
  );
}
