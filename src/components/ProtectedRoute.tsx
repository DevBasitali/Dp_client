"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Wait for hydration

    // If not authenticated and trying to access a protected route
    if (!isAuthenticated && pathname !== "/login") {
      router.push("/login");
      return;
    }

    // Role check if logged in
    if (isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to their default dashboard if they try to access something they shouldn't
      if (user.role === "owner") router.push("/dashboard");
      else if (user.role === "branch_manager") router.push("/branch-dashboard");
      else router.push("/vendor-portal");
    }
  }, [mounted, isAuthenticated, user, pathname, router, allowedRoles]);

  if (!mounted) {
    return null; // Return nothing until hydrated to prevent flashing
  }

  // If not authenticated, the useEffect will redirect. 
  // We can return null to avoid rendering protected content.
  if (!isAuthenticated && pathname !== "/login") return null;

  return <>{children}</>;
}
