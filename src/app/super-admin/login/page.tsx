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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen flex flex-col justify-center px-4 bg-slate-50 relative">
      <button
        onClick={() => router.push("/login")}
        className="absolute top-5 left-5 flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
        style={{ fontSize: "13px", opacity: 0.6 }}
      >
        ← Back to Login
      </button>
      <div className="mb-8 text-center">
        <ShieldCheck className="h-10 w-10 text-[#1B2A4A] mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Dollar Point</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium tracking-wide">
          Super Admin Portal
        </p>
        <div className="w-12 h-1 bg-[#F0A500] mx-auto mt-2 rounded"></div>
      </div>

      <Card className="w-full max-w-md mx-auto shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center text-[#1A1A2E]">
            Super Admin Login
          </CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            Restricted access — authorised personnel only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 text-center font-medium">
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

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-600 text-xs uppercase tracking-wider font-semibold"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@dollarpoint.pk"
                autoComplete="off"
                className={`h-12 px-4 shadow-sm focus-visible:ring-[#1B2A4A] ${
                  form.formState.errors.email ? "border-red-500" : "border-gray-200"
                }`}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 font-medium">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-gray-600 text-xs uppercase tracking-wider font-semibold"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`h-12 px-4 pr-12 shadow-sm focus-visible:ring-[#1B2A4A] ${
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
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 font-medium">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#1B2A4A] hover:bg-slate-800 text-white font-semibold text-[15px] rounded-lg mt-2 shadow-md transition-all active:scale-[0.98]"
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
        </CardContent>
      </Card>

      <p className="text-center text-xs text-gray-400 mt-8">
        Restricted area. Unauthorised access is prohibited.
      </p>
    </div>
  );
}
