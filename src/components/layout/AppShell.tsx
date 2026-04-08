"use client";

import { useAuthStore } from "@/store/authStore";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (!user) return null; // Avoid rendering shell components until hydrated/authenticated

  const isOwner = user.role === "owner";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      {/* Desktop Sidebar (Owner only currently) */}
      {isOwner && <Sidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Mobile (if manager/vendor) or Desktop */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 z-10 shrink-0">
          <div className="flex items-center space-x-4">
            {!isOwner && <span className="font-bold text-[#1B2A4A] text-lg">Dollar Point</span>}
            {isOwner && <span className="md:hidden font-bold text-[#1B2A4A] text-lg">Dollar Point</span>}
          </div>
          <div className="flex items-center">
            {/* Language Toggle Placeholder */}
            <button className="text-sm font-semibold text-gray-500 hover:text-[#1B2A4A]">EN / اردو</button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        {/* Added pb-20 to accommodate the fixed bottom nav on mobile */}
        <main className={`flex-1 overflow-auto p-4 md:p-6 ${!isOwner ? 'pb-24' : ''}`}>
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Manager/Vendor) */}
      {!isOwner && <BottomNav />}
    </div>
  );
}
