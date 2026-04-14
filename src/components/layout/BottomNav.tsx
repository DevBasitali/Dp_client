"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Home, Users, Package, BarChart2, LogOut, BookOpen } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  if (!user || user.role === "owner") return null;

  const isManager = user.role === "branch_manager";

  const links = isManager
    ? [
        { name: "Home", href: "/branch-dashboard", icon: Home },
        { name: "Vendors", href: "/vendors", icon: Users },
        { name: "Orders", href: "/vendor-orders", icon: Package },
        { name: "Closing", href: "/daily-closings", icon: BarChart2 },
      ]
    : [
        { name: "My Ledger", href: "/vendor-portal/ledger", icon: BookOpen },
        { name: "My Orders", href: "/vendor-portal/orders", icon: Package },
      ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-[#1B2A4A]" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-[#1B2A4A]/10 text-[#1B2A4A]" : ""}`} />
              <span className={`text-[10px] font-medium ${isActive ? "text-[#1B2A4A]" : ""}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
        {/* Mobile logout indicator or settings could go here */}
        <button
          onClick={() => logout()}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 hover:text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
}
