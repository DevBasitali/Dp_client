"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user) {
      if (user.role === "owner") router.push("/dashboard");
      else if (user.role === "branch_manager") router.push("/branch-dashboard");
      else router.push("/vendor-portal");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
      <Loader2 className="animate-spin h-8 w-8 text-[#1B2A4A]" />
    </div>
  );
}
