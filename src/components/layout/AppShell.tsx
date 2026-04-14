"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  Menu,
  LogOut,
  Home,
  Users,
  ClipboardList,
  BarChart3,
  LayoutGrid,
  Store,
  CalendarCheck,
  FileBarChart,
  UserCog,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { api } from "@/lib/api";
import Link from "next/link";

/* ─── Owner bottom nav tabs ─────────────────────── */
const OWNER_BOTTOM_TABS = [
  { name: "Home",    href: "/dashboard",      icon: Home },
  { name: "Vendors", href: "/vendors",         icon: Users },
  { name: "Orders",  href: "/vendor-orders",   icon: ClipboardList },
  { name: "Closing", href: "/daily-closings",  icon: BarChart3 },
  { name: "More",    href: null,               icon: LayoutGrid },
] as const;

/* ─── Owner "More" drawer links ─────────────────── */
const OWNER_MORE_LINKS = [
  { name: "Branches",        href: "/branches",         icon: Store },
  { name: "Monthly Closing", href: "/monthly-closings",  icon: CalendarCheck },
  { name: "Reports",         href: "/reports",           icon: FileBarChart },
  { name: "Users",           href: "/users",             icon: UserCog },
  { name: "Settings",        href: "/settings",          icon: SettingsIcon },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  if (!user) return null;

  const isOwner   = user.role === "owner";
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
      {/* Desktop Sidebar (Owner only) */}
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
              /* Hamburger hidden on mobile — bottom nav replaces it */
              <button
                className="hidden md:hidden text-[#1B2A4A] p-1 -ml-1 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            <span className={`font-bold text-[#1B2A4A] text-lg ${isOwner ? "md:hidden" : ""}`}>
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
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 ${
            isOwner ? "pb-24 md:pb-6" : !isOwner ? "pb-24" : ""
          }`}
        >
          <div className="mx-auto max-w-6xl w-full">{children}</div>
        </main>
      </div>

      {/* ── Owner Mobile Bottom Nav ── visible only on mobile */}
      {isOwner && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
          {OWNER_BOTTOM_TABS.map((tab) => {
            const isMore = tab.href === null;
            const isActive = !isMore && pathname.startsWith(tab.href as string);
            const Icon = tab.icon;

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setIsMoreOpen(true)}
                  className="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs text-gray-500 cursor-pointer"
                >
                  <Icon className="w-5 h-5" />
                  <span>More</span>
                </button>
              );
            }

            return (
              <Link
                key={tab.name}
                href={tab.href as string}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs cursor-pointer transition-colors ${
                  isActive ? "text-[#1B2A4A] font-medium" : "text-gray-500"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-[#1B2A4A]" : "text-gray-400"
                  }`}
                />
                <span>{tab.name}</span>
                {isActive && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1B2A4A]" />
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {/* ── Owner "More" Slide-up Drawer ── */}
      {isOwner && isMoreOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-[60] bg-black/40 md:hidden"
            onClick={() => setIsMoreOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl shadow-2xl md:hidden animate-in slide-in-from-bottom duration-300">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-[#1B2A4A]">More</span>
              <button onClick={() => setIsMoreOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-2 pb-[max(env(safe-area-inset-bottom),16px)]">
              {OWNER_MORE_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-4 px-5 py-3.5 w-full transition-colors ${
                      isActive
                        ? "bg-[#1B2A4A]/5 text-[#1B2A4A] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "text-[#1B2A4A]" : "text-gray-400"}`} />
                    <span className="text-sm">{link.name}</span>
                  </Link>
                );
              })}
              {/* Divider */}
              <div className="my-1 mx-5 border-t border-gray-100" />
              {/* Logout */}
              <button
                onClick={() => { setIsMoreOpen(false); handleLogout(); }}
                className="flex items-center gap-4 px-5 py-3.5 w-full text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation (Manager/Vendor) */}
      {!isOwner && <BottomNav />}
    </div>
  );
}
