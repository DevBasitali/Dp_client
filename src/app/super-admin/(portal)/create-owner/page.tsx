"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { saApi } from "@/lib/saApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateOwnerPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      saApi.post("/super-admin/owners", data),
    onSuccess: () => {
      router.push("/super-admin/owners");
    },
    onError: (error: any) => {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 409) {
        setErrorMessage("An account with this email already exists.");
      } else if (message) {
        setErrorMessage(message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    },
  });

  const onSubmit = (data: FormValues) => {
    setErrorMessage("");
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/super-admin/owners"
          className="text-gray-400 hover:text-[#1B2A4A] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#1B2A4A]">Create Owner</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Account is created as approved immediately
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {errorMessage && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-gray-600 text-xs uppercase tracking-wider font-semibold"
            >
              Full Name
            </Label>
            <Input
              id="name"
              placeholder="Owner's full name"
              className={`h-11 px-4 shadow-sm focus-visible:ring-[#1B2A4A] ${
                form.formState.errors.name ? "border-red-500" : "border-gray-200"
              }`}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500 font-medium">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

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
              placeholder="owner@dollarpoint.pk"
              className={`h-11 px-4 shadow-sm focus-visible:ring-[#1B2A4A] ${
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
                className={`h-11 px-4 pr-12 shadow-sm focus-visible:ring-[#1B2A4A] ${
                  form.formState.errors.password
                    ? "border-red-500"
                    : "border-gray-200"
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
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-red-500 font-medium">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="bg-[#1B2A4A] hover:bg-slate-800 text-white font-semibold px-6 h-11 rounded-lg shadow-sm transition-all"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Owner"
              )}
            </Button>
            <Link href="/super-admin/owners">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6 rounded-lg"
              >
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
