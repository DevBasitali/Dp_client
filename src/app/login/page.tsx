"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Store, FileText, Send, Building2, UserCheck, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"owner" | "manager" | "vendor">("owner");

  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await api.post("/auth/login", data);
      return response.data;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user: raw, token } = response.data;
        setAuth({
          userId:   raw.id,
          role:     raw.role,
          branchId: raw.branch_id ?? null,
          vendorId: raw.vendor_id ?? null,
          name:     raw.name,
          email:    raw.email,
        }, token);

        if (raw.role === "owner") {
          router.push("/dashboard");
        } else if (raw.role === "branch_manager") {
          router.push("/branch-dashboard");
        } else {
          router.push("/vendor-portal");
        }
      }
    },
    onError: () => {
      setErrorMessage("Invalid email or password.");
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMessage("");
    loginMutation.mutate(data);
  };

  const handleQuickFill = (email: string) => {
    form.setValue("email", email);
    form.setValue("password", "12345678");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-900 text-white font-sans antialiased">
      {/* Left Column: Visual Showcase (Hidden on smaller screens) */}
      <div 
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-[#1B2A4A]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F0A500]/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3 z-10">
          <div className="p-2.5 bg-white/5 border border-white/10 rounded-2xl shadow-inner shadow-white/5 backdrop-blur-md">
            <svg width="32" height="32" viewBox="0 0 56 56">
              <polygon
                points="28,4 50,16 50,40 28,52 6,40 6,16"
                fill="none"
                stroke="#F0A500"
                strokeWidth="3.5"
              />
              <text
                x="28"
                y="34"
                textAnchor="middle"
                fill="#F0A500"
                fontSize="22"
                fontWeight="bold"
                fontFamily="Inter"
              >
                $
              </text>
            </svg>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">Dollar Point</h1>
            <p className="text-white/40 text-[10px] tracking-widest uppercase">Manage Smarter. Grow Faster.</p>
          </div>
        </div>

        {/* Feature Showcase Grid */}
        <div className="my-auto max-w-lg space-y-8 z-10">
          <div>
            <span className="text-[#F0A500] text-xs font-semibold uppercase tracking-wider px-2.5 py-1 bg-[#F0A500]/10 border border-[#F0A500]/20 rounded-full">
              Enterprise POS & ERP
            </span>
            <h2 className="text-white text-3xl font-extrabold tracking-tight mt-3 leading-tight">
              Streamline Your Multi-Branch Retail Business
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Dollar Point connects branch managers, vendors, and franchise owners into a single, unified database to automate sales closings, ledger tracking, and stock dispatch.
            </p>
          </div>

          <div className="space-y-4">
            {/* Feature 1 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Multi-Branch Sales Reconciliation</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Track cash register totals (CalBox), Easypaisa/cash sales ratios, and local expenses for all outlets.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group">
              <div className="p-2.5 bg-[#F0A500]/10 text-[#F0A500] rounded-xl group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Automated Vendor Ledgers</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Track item profit margins, record supplier purchases, manage installment payments, and review outstanding liabilities.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-3.5 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 group">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">One-Click WhatsApp Purchase Orders</h3>
                <p className="text-slate-400 text-xs mt-1">
                  Draft inventory requirements, generate structured PO invoices, and dispatch them to suppliers via WhatsApp in one click.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Explorer Tabs */}
        <div className="z-10 bg-slate-950/40 p-4 border border-white/5 rounded-2xl backdrop-blur-md">
          <div className="flex space-x-1 border-b border-white/5 pb-2">
            {(["owner", "manager", "vendor"] as const).map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  activeTab === role
                    ? "bg-[#F0A500] text-slate-900 shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {role === "manager" ? "Branch Manager" : role}
              </button>
            ))}
          </div>
          <div className="pt-3 min-h-[60px] text-xs text-slate-400 transition-opacity duration-300">
            {activeTab === "owner" && (
              <p>
                <strong>Owner Dashboard:</strong> View consolidated analytics, calculate Net Bachat, manage users, configure margins, approve owner signups, and control overall settings.
              </p>
            )}
            {activeTab === "manager" && (
              <p>
                <strong>Branch Manager Portal:</strong> Submit daily cash register closing amounts, enter local branch expenses, and monitor outstanding stock shipments.
              </p>
            )}
            {activeTab === "vendor" && (
              <p>
                <strong>Vendor Portal:</strong> Review your supply history, track item performance, inspect payments received, and check outstanding balances.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Clean Login Form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 md:px-12 bg-slate-900">
        <div className="max-w-md w-full space-y-8">
          
          {/* Logo & Intro on Mobile (Hidden on Desktop) */}
          <div className="flex flex-col items-center text-center lg:hidden">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl mb-4 backdrop-blur-md">
              <svg width="44" height="44" viewBox="0 0 56 56">
                <polygon
                  points="28,4 50,16 50,40 28,52 6,40 6,16"
                  fill="none"
                  stroke="#F0A500"
                  strokeWidth="3"
                />
                <text
                  x="28"
                  y="34"
                  textAnchor="middle"
                  fill="#F0A500"
                  fontSize="20"
                  fontWeight="bold"
                  fontFamily="Inter"
                >
                  $
                </text>
              </svg>
            </div>
            <h2 className="text-white text-3xl font-extrabold tracking-tight">Dollar Point</h2>
            <p className="text-slate-400 text-xs tracking-wider uppercase mt-1">Manage Smarter. Grow Faster.</p>
          </div>

          {/* Desktop Heading */}
          <div className="hidden lg:block space-y-2">
            <h2 className="text-white text-3xl font-bold tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm">Sign in to manage your branches & ledgers</p>
          </div>

          {/* Form */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-2xl">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {errorMessage && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-rose-400 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@dollarpoint.pk"
                  className={`h-11 bg-slate-900 border text-slate-100 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#F0A500] transition-colors ${
                    form.formState.errors.email ? "border-rose-500" : "border-slate-800"
                  }`}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`h-11 bg-slate-900 border text-slate-100 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#F0A500] transition-colors ${
                    form.formState.errors.password ? "border-rose-500" : "border-slate-800"
                  }`}
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#F0A500] hover:bg-[#D99500] text-slate-950 font-bold rounded-xl active:scale-[0.98] transition-transform cursor-pointer"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-950" />
                    Signing in...
                  </>
                ) : (
                  <span className="flex items-center justify-center space-x-1.5">
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo logins */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-3">
                Quick Demo Accounts (Autofill)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickFill("arsalan@dollarpoint.pk")}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition-all cursor-pointer group"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">Owner Demo</span>
                    <span className="text-slate-500 text-[10px]">arsalan@...</span>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#F0A500] transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("superadmin@dollarpoint.pk")}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left text-xs transition-all cursor-pointer group"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">Super Admin</span>
                    <span className="text-slate-500 text-[10px]">superadmin@...</span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#F0A500] transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div className="text-center space-y-2">
            <p className="text-slate-400 text-xs">
              New owner?
              <Link href="/signup" className="text-[#F0A500] hover:text-[#D99500] font-semibold cursor-pointer ml-1.5 transition-colors">
                Register your franchise here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
