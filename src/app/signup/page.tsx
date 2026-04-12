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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

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
      <div className="min-h-screen flex flex-col justify-center px-4 bg-slate-50">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Dollar Point</h1>
          <div className="w-12 h-1 bg-[#F0A500] mx-auto mt-2 rounded"></div>
        </div>

        <Card className="w-full max-w-md mx-auto shadow-sm border-0">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
            <h2 className="text-xl font-bold text-[#1B2A4A]">Account Created Successfully</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Your account is pending approval from the administrator. You will be able to login
              once your account is approved.
            </p>
            <Link href="/login" className="w-full mt-2">
              <Button className="w-full h-12 bg-[#1B2A4A] hover:bg-slate-800 text-white font-semibold text-[15px] rounded-lg shadow-md transition-all active:scale-[0.98]">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-slate-50">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Dollar Point</h1>
        <div className="w-12 h-1 bg-[#F0A500] mx-auto mt-2 rounded"></div>
      </div>

      <Card className="w-full max-w-md mx-auto shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center text-[#1A1A2E]">
            Create Owner Account
          </CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            Sign up to get started with Dollar Point
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100 text-center font-medium">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-600 text-xs uppercase tracking-wider font-semibold">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                className={`h-12 px-4 shadow-sm focus-visible:ring-[#1B2A4A] ${
                  form.formState.errors.name ? "border-red-500" : "border-gray-200"
                }`}
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500 font-medium">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-600 text-xs uppercase tracking-wider font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@dollarpoint.pk"
                className={`h-12 px-4 shadow-sm focus-visible:ring-[#1B2A4A] ${
                  form.formState.errors.email ? "border-red-500" : "border-gray-200"
                }`}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-500 font-medium">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-600 text-xs uppercase tracking-wider font-semibold">
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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 font-medium">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-600 text-xs uppercase tracking-wider font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  className={`h-12 px-4 pr-12 shadow-sm focus-visible:ring-[#1B2A4A] ${
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
                <p className="text-xs text-red-500 font-medium">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#1B2A4A] hover:bg-slate-800 text-white font-semibold text-[15px] rounded-lg mt-2 shadow-md transition-all active:scale-[0.98]"
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[#F0A500] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
