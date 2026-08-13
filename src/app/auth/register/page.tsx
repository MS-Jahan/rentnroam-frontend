"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserCheck, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FieldError } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import type { AuthPayload } from "@/lib/types";
import { dashboardPath, formatApiErrorMessage } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "PROVIDER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "CUSTOMER",
    },
  });

  const selectedRole = watch("role");

  async function performRegister(data: RegisterFormValues) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
          role: data.role,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          formatApiErrorMessage(json.message, json.errorDetails, "Registration failed")
        );
      }
      const authData = json.data as AuthPayload;
      setUser(authData.user);
      toast.success("Account created successfully! Welcome to GearUp.");
      router.push(dashboardPath(authData.user.role));
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSocialClick(provider: string) {
    toast.info(
      `${provider} registration is disabled in demo mode. Please complete the form below or use Demo Login.`
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="default" className="mx-auto">New Account</Badge>
        <h1 className="font-display text-4xl uppercase text-ink">Join GearUp Marketplace</h1>
        <p className="text-sm text-muted">
          Create an account to start renting or listing sports equipment.
        </p>
      </div>

      {/* Role Selector Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setValue("role", "CUSTOMER")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition text-center ${
            selectedRole === "CUSTOMER"
              ? "border-blaze bg-blaze/10 text-blaze font-semibold shadow-xs"
              : "border-line bg-panel text-muted hover:text-ink"
          }`}
        >
          <UserCheck className="h-5 w-5 mb-1.5" />
          <span className="text-sm">I Want to Rent</span>
          <span className="text-[10px] opacity-75 font-normal mt-0.5">Customer Account</span>
        </button>

        <button
          type="button"
          onClick={() => setValue("role", "PROVIDER")}
          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition text-center ${
            selectedRole === "PROVIDER"
              ? "border-moss bg-moss/10 text-moss dark:text-fern font-semibold shadow-xs"
              : "border-line bg-panel text-muted hover:text-ink"
          }`}
        >
          <Store className="h-5 w-5 mb-1.5" />
          <span className="text-sm">I Want to List</span>
          <span className="text-[10px] opacity-75 font-normal mt-0.5">Provider Account</span>
        </button>
      </div>

      {/* Standard RHF Register Form */}
      <form
        onSubmit={handleSubmit(performRegister)}
        className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-sm"
      >
        <FormField
          id="name"
          label="Full Name"
          error={errors.name?.message}
          required
        >
          <Input
            type="text"
            placeholder="e.g. Rahim Khan"
            className="rounded-xl"
            {...register("name")}
          />
        </FormField>

        <FormField
          id="email"
          label="Email Address"
          error={errors.email?.message}
          required
        >
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="rounded-xl"
            {...register("email")}
          />
        </FormField>

        <FormField
          id="phone"
          label="Phone Number"
          description="Optional, used for rental pickup notifications"
          error={errors.phone?.message}
        >
          <Input
            type="tel"
            placeholder="+880 1700-000000"
            className="rounded-xl"
            {...register("phone")}
          />
        </FormField>

        <FormField
          id="password"
          label="Password"
          description="Must be at least 6 characters"
          error={errors.password?.message}
          required
        >
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="rounded-xl"
            {...register("password")}
          />
        </FormField>

        <input type="hidden" {...register("role")} />

        <FieldError message={error} />

        <Button
          type="submit"
          loading={loading}
          className="w-full rounded-xl py-3 font-semibold bg-blaze text-white hover:bg-blaze/90 shadow-xs"
        >
          Create Account ({selectedRole === "CUSTOMER" ? "Customer" : "Provider"})
        </Button>

        {/* Social Registration */}
        <div className="pt-3 border-t border-line space-y-3">
          <p className="text-center text-xs text-muted">Or sign up with</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSocialClick("Google")}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-snow py-2.5 text-xs font-medium text-ink hover:bg-moss/5 transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialClick("Facebook")}
              className="flex items-center justify-center gap-2 rounded-xl border border-line bg-snow py-2.5 text-xs font-medium text-ink hover:bg-moss/5 transition"
            >
              <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </div>
      </form>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-blaze hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
