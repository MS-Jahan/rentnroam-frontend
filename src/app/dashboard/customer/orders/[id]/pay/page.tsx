"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { RentalOrder } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export default function PayOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const order = useQuery({
    queryKey: ["rental", id],
    queryFn: () => apiClient<RentalOrder>(`/api/rentals/${id}`, { auth: true }),
  });

  const createPayment = useMutation({
    mutationFn: () =>
      apiClient<{ url: string; sessionId: string }>("/api/payments/create", {
        auth: true,
        method: "POST",
        body: { rentalOrderId: id },
      }),
    onSuccess: (data) => {
      // Store session for success page confirmation fallback
      sessionStorage.setItem("gearup_last_session", data.sessionId);
      window.location.href = data.url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (order.isLoading) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink/50">Loading order…</div>;
  }

  if (order.isError || !order.data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">{(order.error as Error)?.message || "Order not found"}</p>
        <Link href="/dashboard/customer" className="mt-4 inline-block text-fern">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const o = order.data;

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="font-display text-4xl uppercase text-ink">Pay for rental</h1>
      <div className="mt-6 space-y-3 rounded-xl border border-moss/10 bg-snow p-6">
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Status</span>
          <StatusBadge status={o.status} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Gear</span>
          <span>{o.items?.map((i) => i.gearItem?.name).join(", ")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink/60">Dates</span>
          <span>
            {new Date(o.startDate).toLocaleDateString()} →{" "}
            {new Date(o.endDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between border-t border-moss/10 pt-3 text-lg font-semibold">
          <span>Total</span>
          <span>{formatMoney(o.totalAmount)}</span>
        </div>
        <p className="text-xs text-ink/50">
          You will be redirected to Stripe Checkout (test card 4242…). After
          payment, return to your dashboard. See docs/CONFUSIONS.md for API
          return URL notes.
        </p>
        <Button
          className="w-full"
          loading={createPayment.isPending}
          onClick={() => createPayment.mutate()}
        >
          Pay with Stripe
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
