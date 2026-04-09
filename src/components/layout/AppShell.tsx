"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null; // Avoid rendering shell components until hydrated/authenticated

  const isOwner = user.role === "owner";

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
        {/* Top Header Mobile (if manager/vendor) or Desktop */}
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
          <div className="flex items-center">
            {/* Language Toggle Placeholder */}
            <button className="text-sm font-semibold text-gray-500 hover:text-[#1B2A4A]">EN / اردو</button>
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
