"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { RentalOrder } from "@/lib/types";
import { formatMoney, cn, tapNav } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

const PENDING_CHECKOUT_KEY = "gearup_pending_checkout";

function isPayable(order: RentalOrder) {
  return (
    order.status === "CONFIRMED" &&
    order.payment?.status !== "COMPLETED"
  );
}

export default function PayOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const autoCheckoutAttempted = useRef(false);

  const order = useQuery({
    queryKey: ["rental", id],
    queryFn: () => apiClient<RentalOrder>(`/api/rentals/${id}`, { auth: true }),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PLACED" ? 5000 : false;
    },
  });

  const createPayment = useMutation({
    mutationFn: () =>
      apiClient<{ url: string; sessionId: string }>("/api/payments/create", {
        auth: true,
        method: "POST",
        body: { rentalOrderId: id },
      }),
    onSuccess: (data) => {
      sessionStorage.setItem("gearup_last_session", data.sessionId);
      sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
      window.location.href = data.url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { mutate: startCheckout, isPending: checkoutPending } = createPayment;

  const payable = order.data ? isPayable(order.data) : false;
  const awaitingConfirmation = order.data?.status === "PLACED";
  const alreadyPaid =
    order.data?.payment?.status === "COMPLETED" || order.data?.status === "PAID";

  useEffect(() => {
    if (!order.data || !payable || checkoutPending) return;

    const pendingId = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (pendingId !== id || autoCheckoutAttempted.current) return;

    autoCheckoutAttempted.current = true;
    startCheckout();
  }, [order.data, payable, checkoutPending, id, startCheckout]);

  if (order.isLoading) {
    return <div className="mx-auto max-w-lg px-4 py-16 text-ink/50">Loading order…</div>;
  }

  if (order.isError || !order.data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">{(order.error as Error)?.message || "Order not found"}</p>
        <Link href="/dashboard/customer" className={cn("mt-4 inline-block text-fern", tapNav)}>
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

        {awaitingConfirmation && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Order placed. Waiting for the provider to confirm availability. Stripe
            Checkout opens automatically once the order is confirmed.
          </div>
        )}

        {alreadyPaid && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            This order is already paid. Check your dashboard for pickup details.
          </div>
        )}

        {payable && (
          <>
            <p className="text-xs text-ink/50">
              You will open Stripe Checkout next. Use test card 4242 4242 4242 4242
              with any future expiry and CVC.
            </p>
            <Button
              className="w-full"
              loading={checkoutPending}
              onClick={() => startCheckout()}
            >
              Pay with Stripe
            </Button>
          </>
        )}

        {!payable && !awaitingConfirmation && !alreadyPaid && (
          <p className="text-xs text-ink/50">
            Payment is not available for this order in its current status.
          </p>
        )}

        <Button variant="ghost" className="w-full" onClick={() => router.back()}>
          {awaitingConfirmation ? "Back to dashboard" : "Cancel"}
        </Button>
      </div>
    </div>
  );
}
