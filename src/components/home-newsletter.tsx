"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeNewsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/proxy?path=/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to subscribe");
      }
      setSubscribed(true);
      toast.success("Subscribed! Thank you for joining GearUp updates.");
      setEmail("");
    } catch (err: any) {
      // Fallback: direct public API request if proxy isn't set up yet
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setSubscribed(true);
          toast.success("Subscribed! Thank you for joining GearUp updates.");
          setEmail("");
          return;
        }
      } catch {}
      toast.error(err.message || "Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {subscribed ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">You are subscribed to GearUp newsletter!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email for trail updates..."
            required
            className="w-full rounded-xl border border-line bg-snow px-4 py-3 text-sm text-ink outline-none ring-blaze/30 focus:ring-2 placeholder:text-muted"
          />
          <Button
            type="submit"
            loading={loading}
            className="shrink-0 rounded-xl px-5 py-3 font-semibold bg-blaze text-white hover:bg-blaze/90"
          >
            <Send className="h-4 w-4" />
            <span>Subscribe</span>
          </Button>
        </form>
      )}
    </div>
  );
}
