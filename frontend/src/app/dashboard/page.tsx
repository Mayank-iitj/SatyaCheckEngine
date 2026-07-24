"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardRedirect() {
  const { user, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-in");
      return;
    }

    switch (user.role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "UNIVERSITY":
        router.push("/university");
        break;
      case "RECRUITER":
        router.push("/recruiter");
        break;
      case "STUDENT":
      default:
        router.push("/student");
        break;
    }
  }, [user, isLoaded, router]);

  return (
    <div className="min-h-screen bg-parchment-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-parchment-300 border-t-bronze rounded-full animate-spin" />
    </div>
  );
}
