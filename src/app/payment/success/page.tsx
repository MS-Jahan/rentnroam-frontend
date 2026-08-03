"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("gearup_last_session")
      : null);
  const [status, setStatus] = useState<"idle" | "confirming" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      setStatus("confirming");
      try {
        await apiClient("/api/payments/confirm", {
          auth: true,
          method: "POST",
          body: { sessionId },
        });
        if (!cancelled) {
          setStatus("done");
          setMessage("Payment confirmed. Your order is marked paid.");
          sessionStorage.removeItem("gearup_last_session");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            e instanceof Error
              ? e.message
              : "Could not confirm yet - webhook may still process it."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 dark:border-emerald-800 dark:bg-emerald-950/50">
        <h1 className="font-display text-4xl uppercase text-emerald-900 dark:text-emerald-100">
          Payment successful
        </h1>
        <p className="mt-3 text-emerald-800/80 dark:text-emerald-200/80">
          {status === "confirming"
            ? "Confirming with the server…"
            : message ||
              "Your Stripe payment was received. Check your dashboard for order status."}
        </p>
        <Link href="/dashboard/customer" className="mt-6 inline-block">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
