"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Schema matching the expected backend logic
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await api.post("/auth/login", data);
      return response.data; // { success, data: { user, token } }
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuth(user, token);

        // Redirect based on role
        if (user.role === "owner") {
          router.push("/dashboard");
        } else if (user.role === "branch_manager") {
          router.push("/branch-dashboard");
        } else {
          router.push("/vendor-portal");
        }
      }
    },
    onError: (error: any) => {
      setErrorMessage(
        error.response?.data?.message || "An unexpected error occurred. Please try again."
      );
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMessage("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 bg-slate-50">
      <div className="mb-8 text-center">
        {/* Brand Header */}
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Dollar Point</h1>
        <div className="w-12 h-1 bg-[#F0A500] mx-auto mt-2 rounded"></div>
      </div>

      <Card className="w-full max-w-md mx-auto shadow-sm border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center text-[#1A1A2E]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-sm text-gray-500">
            Sign in to access your portal
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
              <Label htmlFor="email" className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Email</Label>
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
              <Label htmlFor="password" className="text-gray-600 text-xs uppercase tracking-wider font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className={`h-12 px-4 shadow-sm focus-visible:ring-[#1B2A4A] ${
                  form.formState.errors.password ? "border-red-500" : "border-gray-200"
                }`}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-500 font-medium">{form.formState.errors.password.message}</p>
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
                "Log In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer support text */}
      <p className="text-center text-xs text-gray-400 mt-8">
        Designed for Dollar Point internal use. Need help? Contact the owner.
      </p>
    </div>
  );
}
