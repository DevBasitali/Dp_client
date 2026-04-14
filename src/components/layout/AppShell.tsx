"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { api } from "@/lib/api";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null; // Avoid rendering shell components until hydrated/authenticated

  const isOwner = user.role === "owner";
  const isManager = user.role === "branch_manager";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // proceed with logout even if API call fails
    }
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      {/* Desktop Sidebar (Owner only currently) */}
      {isOwner && (
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          closeMobile={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Top Header */}
        <header className="min-h-16 pt-[max(env(safe-area-inset-top),12px)] md:pt-0 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            {isOwner && (
              <button
                className="md:hidden text-[#1B2A4A] p-1 -ml-1 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <span className={`font-bold text-[#1B2A4A] text-lg ${isOwner ? 'md:hidden' : ''}`}>
              Dollar Point
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Manager: name + role + logout */}
            {isManager && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-[#1A1A2E] leading-tight truncate max-w-[140px]">
                    {user.name || "Manager"}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Branch Manager</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors px-2 py-1.5 hover:bg-red-50 rounded-lg"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-medium hidden sm:inline">Logout</span>
                </button>
                <div className="w-px h-5 bg-gray-200" />
              </div>
            )}
            {/* Language Toggle */}
            {/* <button className="text-sm font-semibold text-gray-500 hover:text-[#1B2A4A]">EN / اردو</button> */}
          </div>
        </header>

        {/* Scrollable Page Content */}
        {/* Added pb-20 to accommodate the fixed bottom nav on mobile */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 ${!isOwner ? 'pb-24' : ''}`}>
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Manager/Vendor) */}
      {!isOwner && <BottomNav />}
    </div>
  );
}
