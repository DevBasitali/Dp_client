"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { LayoutDashboard, Users, Store, Package, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Vendors", href: "/vendors", icon: Users },
    { name: "Items", href: "/items", icon: Package },
    { name: "Branches", href: "/branches", icon: Store },
    { name: "Purchases", href: "/purchases", icon: Package },
  ];

  return (
    <aside className="w-64 bg-[#1B2A4A] text-white flex-col hidden md:flex h-full shadow-lg">
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <h2 className="text-xl font-bold flex items-center">
          <Store className="mr-2 text-[#F0A500]" />
          Dollar Point
        </h2>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive ? "bg-slate-800 text-[#F0A500]" : "hover:bg-slate-800 text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-4">
          <p className="text-sm font-semibold truncate">{user?.name || "Admin"}</p>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors w-full p-2 hover:bg-slate-800 rounded-lg"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
