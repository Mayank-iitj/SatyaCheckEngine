import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function getCredentialTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    DEGREE: "Degree",
    DIPLOMA: "Diploma",
    TRANSCRIPT: "Transcript",
    MICRO_CREDENTIAL: "Micro-Credential",
    CERTIFICATE: "Certificate",
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "VALID":
      return "text-emerald-500";
    case "REVOKED":
      return "text-red-500";
    case "NOT_FOUND":
      return "text-slate-400";
    default:
      return "text-amber-500";
  }
}
