"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UserCheck, Shield, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, FieldError } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth";
import type { AuthPayload } from "@/lib/types";
import { startOAuth } from "@/lib/oauth";
import { dashboardPath, formatApiErrorMessage, cn, tapPress, tapNav } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      toast.error("Social login failed. Please try again or use email/password.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function performLogin(data: LoginFormValues) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          formatApiErrorMessage(json.message, json.errorDetails, "Login failed")
        );
      }
      const authData = json.data as AuthPayload;
      setUser(authData.user);
      toast.success(`Welcome back, ${authData.user.name}!`);
      const next = searchParams.get("next");
      router.push(next || dashboardPath(authData.user.role));
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleDemoLogin(email: string, pass: string, roleName: string) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    toast.info(`Filling credentials for Demo ${roleName}...`);
    performLogin({ email, password: pass });
  }

  const next = searchParams.get("next") ?? undefined;

  return (
    <div className="mx-auto max-w-md px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="default" className="mx-auto">Account Access</Badge>
        <h1 className="font-display text-4xl uppercase text-ink">Sign In to RentNRoam</h1>
        <p className="text-sm text-muted">
          Access your rentals, manage equipment, or review analytics.
        </p>
      </div>

      {/* One-Click Demo Credentials Card */}
      <div className="rounded-2xl border border-blaze/30 bg-blaze/5 p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blaze">
          <Sparkles className="h-4 w-4" />
          <span>One-Click Demo Access</span>
        </div>
        <p className="text-xs text-muted">
          Select a role to instantly test features without creating an account:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDemoLogin("customer@gearup.com", "Customer@123", "Customer")}
            className={cn(
              "flex flex-col items-center justify-center p-2.5 rounded-xl border border-line bg-panel text-xs font-semibold text-ink hover:border-blaze hover:text-blaze transition shadow-2xs",
              tapPress
            )}
          >
            <UserCheck className="h-4 w-4 mb-1 text-blaze" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("provider@gearup.com", "Provider@123", "Provider")}
            className={cn(
              "flex flex-col items-center justify-center p-2.5 rounded-xl border border-line bg-panel text-xs font-semibold text-ink hover:border-moss hover:text-moss transition shadow-2xs",
              tapPress
            )}
          >
            <KeyRound className="h-4 w-4 mb-1 text-moss dark:text-fern" />
            <span>Provider</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin("admin@gearup.com", "Admin@12345", "Admin")}
            className={cn(
              "flex flex-col items-center justify-center p-2.5 rounded-xl border border-line bg-panel text-xs font-semibold text-ink hover:border-purple-500 hover:text-purple-600 transition shadow-2xs",
              tapPress
            )}
          >
            <Shield className="h-4 w-4 mb-1 text-purple-600" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Standard RHF Login Form */}
      <form
        onSubmit={handleSubmit(performLogin)}
        className="space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-sm"
      >
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
          id="password"
          label="Password"
          error={errors.password?.message}
          required
        >
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="rounded-xl"
            {...register("password")}
          />
        </FormField>

        <FieldError message={error} />

        <Button
          type="submit"
          loading={loading}
          className="w-full rounded-xl py-3 font-semibold bg-blaze text-white hover:bg-blaze/90 shadow-xs"
        >
          Sign In
        </Button>

        {/* Social Authentication Buttons */}
        <div className="pt-3 border-t border-line space-y-3">
          <p className="text-center text-xs text-muted">Or continue with</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => startOAuth("google", { next })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-line bg-snow py-2.5 text-xs font-medium text-ink hover:bg-moss/5 transition",
                tapPress
              )}
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
              onClick={() => startOAuth("facebook", { next })}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-line bg-snow py-2.5 text-xs font-medium text-ink hover:bg-moss/5 transition",
                tapPress
              )}
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
        New to RentNRoam?{" "}
        <Link href="/auth/register" className={cn("font-semibold text-blaze hover:underline", tapNav)}>
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
