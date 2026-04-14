"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { saApi, SA_TOKEN_KEY, decodeSaToken } from "@/lib/saApi";
import {
  LayoutDashboard,
  Users,
  Clock,
  UserPlus,
  ShieldPlus,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Home,
} from "lucide-react";

function usePendingCount() {
  const { data } = useQuery({
    queryKey: ["sa-pending-count"],
    queryFn: async () => {
      const res = await saApi.get("/super-admin/dashboard");
      return (res.data?.data?.stats?.pendingApprovals as number) ?? 0;
    },
    staleTime: 30_000,
    retry: false,
  });
  return data ?? 0;
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pendingCount = usePendingCount();

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(SA_TOKEN_KEY)
        : null;
    if (!token) {
      router.replace("/super-admin/login");
      return;
    }
    const payload = decodeSaToken();
    setAdminName((payload?.name as string) || "Super Admin");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem(SA_TOKEN_KEY);
    router.push("/super-admin/login");
  };

  // ── Sidebar nav links (desktop) ──
  const navLinks = [
    { name: "Dashboard",         href: "/super-admin/dashboard",         icon: LayoutDashboard },
    { name: "Owners",            href: "/super-admin/owners",            icon: Users },
    { name: "Pending Approvals", href: "/super-admin/owners",            icon: Clock, badge: pendingCount },
    { name: "Create Owner",      href: "/super-admin/create-owner",      icon: UserPlus },
    { name: "Create Super Admin",href: "/super-admin/create-super-admin",icon: ShieldPlus },
  ];

  // ── Mobile bottom nav tabs ──
  const BOTTOM_TABS = [
    { name: "Home",    href: "/super-admin/dashboard", icon: Home,  badge: 0 },
    { name: "Owners",  href: "/super-admin/owners",    icon: Users, badge: 0 },
    {
      name: "Pending",
      href: "/super-admin/owners?status=PENDING",
      icon: Clock,
      badge: pendingCount,
    },
    { name: "More", href: null, icon: Menu, badge: 0 },
  ] as const;

  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#F0A500]" />
          <span className="text-base font-bold text-white leading-tight">
            Dollar Point
          </span>
        </div>
        <button
          className="md:hidden text-white/60 hover:text-white"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? "bg-slate-800 text-[#F0A500]"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{link.name}</span>
              {link.badge != null && link.badge > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-700 shrink-0">
        <p className="text-sm font-semibold text-white truncate px-2 mb-1">
          {adminName}
        </p>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider px-2 mb-3">
          Super Admin
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 w-full px-2 py-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-[#1B2A4A] text-white hidden md:flex flex-col h-full shadow-lg shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay (kept for fallback / legacy — hidden behind bottom nav) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-[#1B2A4A] text-white flex flex-col h-full shadow-2xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden text-[#1B2A4A] p-1 -ml-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-[#1B2A4A] text-sm md:text-base">
              Dollar Point{" "}
              <span className="text-slate-400 font-normal">— Super Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block font-medium">
              {adminName}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 px-2 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pb-24 md:pb-6">
          <div className="mx-auto max-w-6xl w-full">{children}</div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        {BOTTOM_TABS.map((tab) => {
          const isMore = tab.href === null;
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

          const isActive =
            pathname === tab.href ||
            pathname.startsWith((tab.href as string).split("?")[0] + "/");

          return (
            <Link
              key={tab.name}
              href={tab.href as string}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs cursor-pointer relative transition-colors ${
                isActive ? "text-[#1B2A4A] font-medium" : "text-gray-500"
              }`}
            >
              <span className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-[#1B2A4A]" : "text-gray-400"
                  }`}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white text-[9px] font-bold px-1 py-px rounded-full min-w-[14px] text-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span>{tab.name}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1B2A4A]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── "More" Slide-up Drawer ── */}
      {isMoreOpen && (
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
              <button
                onClick={() => setIsMoreOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-2 pb-[max(env(safe-area-inset-bottom),16px)]">
              {/* Create Owner */}
              <Link
                href="/super-admin/create-owner"
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center gap-4 px-5 py-3.5 w-full transition-colors ${
                  pathname === "/super-admin/create-owner"
                    ? "bg-[#1B2A4A]/5 text-[#1B2A4A] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <UserPlus className={`w-5 h-5 ${pathname === "/super-admin/create-owner" ? "text-[#1B2A4A]" : "text-gray-400"}`} />
                <span className="text-sm">Create Owner</span>
              </Link>
              {/* Create Super Admin */}
              <Link
                href="/super-admin/create-super-admin"
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center gap-4 px-5 py-3.5 w-full transition-colors ${
                  pathname === "/super-admin/create-super-admin"
                    ? "bg-[#1B2A4A]/5 text-[#1B2A4A] font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ShieldPlus className={`w-5 h-5 ${pathname === "/super-admin/create-super-admin" ? "text-[#1B2A4A]" : "text-gray-400"}`} />
                <span className="text-sm">Create Super Admin</span>
              </Link>
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
    </div>
  );
}
