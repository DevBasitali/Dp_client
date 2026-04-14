"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

const SA_TOKEN_KEY = "sa_token";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const pageStyle = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

const cardStyle = { boxShadow: "0 25px 50px rgba(0,0,0,0.4)" };

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showRegularLoginLink, setShowRegularLoginLink] = useState(false);

  useEffect(() => {
    setErrorMessage("");
    setShowRegularLoginLink(false);
    window.history.replaceState({}, document.title, "/super-admin/login");
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await axios.post(`${baseURL}/auth/super-admin-login`, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        localStorage.setItem(SA_TOKEN_KEY, response.data.token);
        router.push("/super-admin/dashboard");
      }
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 403) {
        setErrorMessage(
          message || "These credentials are not for the Super Admin portal."
        );
        setShowRegularLoginLink(true);
      } else if (status === 401) {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMessage("");
    setShowRegularLoginLink(false);
    loginMutation.mutate(data);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#1B2A4A]"
      style={pageStyle}
    >
      {/* Logo section */}
      <div className="flex flex-col items-center mb-6">
        <p className="text-[#F0A500] text-xs tracking-widest mb-4">SUPER ADMIN PORTAL</p>
        <div style={{ filter: "drop-shadow(0 0 12px rgba(240,165,0,0.5))" }}>
          <svg width="56" height="56" viewBox="0 0 56 56">
            <path
              d="M28 4 L48 12 L48 28 C48 40 28 52 28 52 C28 52 8 40 8 28 L8 12 Z"
              fill="none"
              stroke="#F0A500"
              strokeWidth="2"
            />
            <path
              d="M20 28 L25 33 L36 22"
              fill="none"
              stroke="#F0A500"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="text-white text-3xl font-bold tracking-wide mt-3">Dollar Point</h1>
        <p className="text-white/40 text-xs tracking-widest mt-1">MANAGE SMARTER. GROW FASTER.</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-3xl mx-4 p-8 max-w-sm w-full" style={cardStyle}>
        <h2 className="text-[#1B2A4A] text-2xl font-bold">Super Admin Login</h2>
        <p className="text-gray-400 text-sm mt-1 mb-6">Restricted access — authorised only</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {errorMessage}
              {showRegularLoginLink && (
                <div className="mt-2">
                  <Link
                    href="/login"
                    className="text-[#1B2A4A] underline hover:text-slate-700 font-semibold"
                  >
                    Go to Regular Login →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="admin@dollarpoint.pk"
              autoComplete="off"
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`h-12 bg-gray-50 border rounded-xl px-4 pr-12 text-[#1A1A2E] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1B2A4A] focus:bg-white transition-all ${
                  form.formState.errors.password ? "border-red-500" : "border-gray-200"
                }`}
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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
                Authenticating...
              </>
            ) : (
              "Super Admin Login"
            )}
          </Button>
        </form>
      </div>

      {/* Back to regular login */}
      <div className="text-center mt-6">
        <button
          onClick={() => router.push("/login")}
          className="text-white/30 text-xs hover:text-white/50 transition-colors"
        >
          ← Regular Login
        </button>
      </div>
    </div>
  );
}
