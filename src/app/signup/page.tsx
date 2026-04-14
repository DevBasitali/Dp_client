"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";

const signupSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const pageStyle = {
  backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
  backgroundSize: "20px 20px",
};

const cardStyle = { boxShadow: "0 25px 50px rgba(0,0,0,0.4)" };

function LogoSection() {
  return (
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
  );
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormValues) => {
      const response = await api.post("/auth/signup", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 409) {
        setErrorMessage("An account with this email already exists.");
      } else if (status === 400 && message) {
        setErrorMessage(message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    setErrorMessage("");
    signupMutation.mutate(data);
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#1B2A4A]"
        style={pageStyle}
      >
        <LogoSection />
        <div className="bg-white rounded-3xl mx-4 p-8 max-w-sm w-full flex flex-col items-center text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#22c55e" strokeWidth="2" fill="#dcfce7" />
              <path
                d="M9 16.5L13.5 21L23 11"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-[#1B2A4A] text-xl font-bold">Account Created!</h2>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Pending approval from administrator.
          </p>
          <Link href="/login" className="w-full mt-4">
            <Button
              variant="outline"
              className="w-full h-12 border-[#1B2A4A] text-[#1B2A4A] rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform hover:bg-[#1B2A4A] hover:text-white"
            >
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-[#1B2A4A]"
      style={pageStyle}
    >
      <LogoSection />

      <div className="bg-white rounded-3xl mx-4 p-8 max-w-sm w-full" style={cardStyle}>
        <h2 className="text-[#1B2A4A] text-2xl font-bold">Create Account</h2>
        <p className="text-gray-400 text-sm mt-1 mb-6">Start managing your store today</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your full name"
              className={`h-12 bg-gray-50 border rounded-xl px-4 text-[#1A1A2E] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1B2A4A] focus:bg-white transition-all ${
                form.formState.errors.name ? "border-red-500" : "border-gray-200"
              }`}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

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

          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                className={`h-12 bg-gray-50 border rounded-xl px-4 pr-12 text-[#1A1A2E] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1B2A4A] focus:bg-white transition-all ${
                  form.formState.errors.confirmPassword ? "border-red-500" : "border-gray-200"
                }`}
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#1B2A4A] text-white rounded-xl font-semibold text-sm mt-2 active:scale-[0.98] transition-transform hover:bg-slate-800"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>

      <p className="text-white/40 text-xs text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#F0A500] font-medium cursor-pointer">
          Login
        </Link>
      </p>
    </div>
  );
}
