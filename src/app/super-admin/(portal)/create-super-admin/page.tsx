"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { saApi } from "@/lib/saApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function CreateSuperAdminPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      saApi.post("/super-admin/super-admins", data),
    onSuccess: (_, variables) => {
      setCreatedName(variables.name);
      setSuccess(true);
      form.reset();
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
      <div>
        <h1 className="text-xl font-bold text-[#1B2A4A]">Create Super Admin</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Grant super admin access to another user
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-4 max-w-lg">
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">
              Super admin created successfully
            </p>
            <p className="text-sm text-green-700 mt-0.5">
              <span className="font-medium">{createdName}</span> now has super admin access.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs text-green-600 underline mt-2 hover:text-green-800"
            >
              Create another
            </button>
          </div>
        </div>
      )}

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
              placeholder="Admin's full name"
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
              placeholder="admin@dollarpoint.pk"
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

          <div className="pt-2">
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
                "Create Super Admin"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
