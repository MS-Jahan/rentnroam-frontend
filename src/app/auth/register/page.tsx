"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select } from "@/components/ui/field";
import { useAuthStore } from "@/store/auth";
import type { AuthPayload } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">("CUSTOMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          role,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Registration failed");
      }
      const data = json.data as AuthPayload;
      setUser(data.user);
      toast.success("Account created");
      router.push(dashboardPath(data.user.role));
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="font-display text-4xl uppercase text-ink">Join GearUp</h1>
      <p className="mt-2 text-sm text-ink/60">
        Choose a role — customer to rent, or provider to list gear.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-moss/10 bg-snow p-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="role">I want to</Label>
          <Select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "CUSTOMER" | "PROVIDER")}
          >
            <option value="CUSTOMER">Rent gear (Customer)</option>
            <option value="PROVIDER">List gear (Provider)</option>
          </Select>
        </div>
        <FieldError message={error} />
        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-fern">
          Sign in
        </Link>
      </p>
    </div>
  );
}
