"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { LayoutDashboard, Users, UserCog, Store, Package, LogOut, X, ClipboardList, Wallet, CalendarCheck, BarChart3, Settings as SettingsIcon } from "lucide-react";

interface SidebarProps {
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export default function Sidebar({ isMobileOpen, closeMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const prefetchMap: Record<string, () => void> = {
    '/dashboard': () => queryClient.prefetchQuery({
      queryKey: ['dashboard-owner'],
      queryFn: () => api.get('/dashboard/owner').then(r => r.data.data),
      staleTime: 60 * 1000,
    }),
    '/vendors': () => queryClient.prefetchQuery({
      queryKey: ['vendors'],
      queryFn: () => api.get('/vendors').then(r => r.data.data || []),
      staleTime: 10 * 60 * 1000,
    }),
    '/daily-closings': () => queryClient.prefetchQuery({
      queryKey: ['daily-closings', {}],
      queryFn: () => api.get('/daily-closings').then(r => r.data.data || []),
      staleTime: 2 * 60 * 1000,
    }),
  };

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Branches", href: "/branches", icon: Store },
    { name: "Vendors", href: "/vendors", icon: Users },
    // { name: "Items", href: "/items", icon: Package },
    { name: "Vendor Orders", href: "/vendor-orders", icon: ClipboardList },
    { name: "Daily Closing", href: "/daily-closings", icon: Wallet },
    { name: "Monthly Closing", href: "/monthly-closings", icon: CalendarCheck },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Users", href: "/users", icon: UserCog },
    { name: "Settings", href: "/settings", icon: SettingsIcon },
  ];

  const SidebarContent = (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700 shrink-0">
        <h2 className="text-xl font-bold flex items-center">
          <Store className="mr-2 text-[#F0A500]" />
          Dollar Point
        </h2>
        <button className="md:hidden text-white/70 hover:text-white" onClick={closeMobile}>
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={closeMobile}
              onMouseEnter={() => prefetchMap[link.href]?.()}
              className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg transition-colors ${isActive ? "bg-slate-800 text-[#F0A500]" : "hover:bg-slate-800 text-slate-300"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-base md:text-sm">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 shrink-0">
        <div className="mb-4 px-2">
          <p className="text-sm font-semibold truncate text-white">{user?.name || "Admin"}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full p-3 md:p-2 hover:bg-slate-800 rounded-lg"
        >
          <LogOut className="w-5 h-5 md:w-4 md:h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#1B2A4A] text-white hidden md:flex flex-col h-full shadow-lg z-20">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeMobile}
          ></div>

          {/* Slide-out Menu */}
          <aside className="relative w-72 max-w-[80%] bg-[#1B2A4A] text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
