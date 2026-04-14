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
import { Loader2 } from "lucide-react";
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#1B2A4A]"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Logo section */}
      <div className="flex flex-col items-center mb-6">
        <div style={{ filter: "drop-shadow(0 0 12px rgba(240,165,0,0.5))" }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <polygon
              points="28,4 50,16 50,40 28,52 6,40 6,16"
              fill="none"
              stroke="#F0A500"
              strokeWidth="2"
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
        <h1 className="text-white text-3xl font-bold tracking-wide mt-3">Dollar Point</h1>
        <p className="text-white/40 text-xs tracking-widest mt-1">MANAGE SMARTER. GROW FASTER.</p>
      </div>

      {/* Form card */}
      <div
        className="bg-white rounded-3xl mx-4 p-8 max-w-sm w-full"
        style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
      >
        <h2 className="text-[#1B2A4A] text-2xl font-bold">Welcome Back</h2>
        <p className="text-gray-400 text-sm mt-1 mb-6">Sign in to your account</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm mt-3">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@dollarpoint.pk"
              className={`h-12 bg-gray-50 border rounded-xl px-4 text-[#1A1A2E] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1B2A4A] focus:bg-white transition-all ${
                form.formState.errors.email ? "border-red-500" : "border-gray-200"
              }`}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`h-12 bg-gray-50 border rounded-xl px-4 text-[#1A1A2E] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1B2A4A] focus:bg-white transition-all ${
                form.formState.errors.password ? "border-red-500" : "border-gray-200"
              }`}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#1B2A4A] text-white rounded-xl font-semibold text-sm mt-2 active:scale-[0.98] transition-transform hover:bg-slate-800"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Log In"
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-white/40 text-xs text-center mt-6">
        New owner?
        <Link href="/signup" className="text-[#F0A500] font-medium cursor-pointer ml-1">
          Sign up here
        </Link>
      </p>

    </div>
  );
}
