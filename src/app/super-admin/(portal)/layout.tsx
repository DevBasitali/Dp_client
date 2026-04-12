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
  ShieldPlus,
  LogOut,
  Menu,
  X,
  ShieldCheck,
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

  const navLinks = [
    { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { name: "Owners", href: "/super-admin/owners", icon: Users },
    {
      name: "Pending Approvals",
      href: "/super-admin/owners",
      icon: Clock,
      badge: pendingCount,
    },
    {
      name: "Create Super Admin",
      href: "/super-admin/create-super-admin",
      icon: ShieldPlus,
    },
  ];

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

      {/* Mobile Sidebar Overlay */}
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <div className="mx-auto max-w-6xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
