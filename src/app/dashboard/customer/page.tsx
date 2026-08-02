"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/lib/api";
import type { Paginated, Payment, RentalOrder, Review } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { useAuthStore } from "@/store/auth";

export default function CustomerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [reviewOrder, setReviewOrder] = useState<RentalOrder | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const orders = useQuery({
    queryKey: ["customer-orders"],
    queryFn: () =>
      apiClient<Paginated<RentalOrder>>("/api/rentals?limit=20", { auth: true }),
  });

  const payments = useQuery({
    queryKey: ["customer-payments"],
    queryFn: () =>
      apiClient<Paginated<Payment>>("/api/payments?limit=20", { auth: true }),
  });

  const cancel = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/rentals/${id}/cancel`, { auth: true, method: "PATCH" }),
    onSuccess: () => {
      toast.success("Order cancelled");
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pay = useMutation({
    mutationFn: (rentalOrderId: string) =>
      apiClient<{ url: string; sessionId: string }>("/api/payments/create", {
        auth: true,
        method: "POST",
        body: { rentalOrderId },
      }),
    onSuccess: (data) => {
      toast.success("Redirecting to Stripe checkout");
      window.location.href = data.url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const review = useMutation({
    mutationFn: () => {
      const gearItemId = reviewOrder?.items?.[0]?.gearItemId;
      if (!reviewOrder || !gearItemId) throw new ApiError("Missing gear", 400);
      return apiClient<Review>("/api/reviews", {
        auth: true,
        method: "POST",
        body: {
          rentalOrderId: reviewOrder.id,
          gearItemId,
          rating,
          comment: comment || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success("Review submitted");
      setReviewOrder(null);
      setComment("");
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submitReview(e: FormEvent) {
    e.preventDefault();
    review.mutate();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl uppercase text-ink">Customer dashboard</h1>
      <p className="mt-1 text-ink/60">
        Welcome{user ? `, ${user.name}` : ""}. Track rentals, pay, and leave reviews.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl uppercase">Rental orders</h2>
        {orders.isLoading ? (
          <p className="mt-4 text-ink/50">Loading orders…</p>
        ) : orders.isError ? (
          <p className="mt-4 text-red-600">{(orders.error as Error).message}</p>
        ) : !orders.data?.items.length ? (
          <p className="mt-4 rounded-lg border border-dashed border-moss/20 bg-snow p-6 text-ink/60">
            No orders yet.{" "}
            <Link href="/gear" className="font-semibold text-fern">
              Browse gear
            </Link>
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-moss/10 bg-snow">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-moss/10 bg-mist/60 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.items.map((o) => (
                  <tr key={o.id} className="border-b border-moss/5">
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.items?.[0]?.gearItem?.name || o.id.slice(0, 8)}</p>
                      <p className="text-xs text-ink/50">{o.provider?.name}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      {new Date(o.startDate).toLocaleDateString()} →{" "}
                      {new Date(o.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{formatMoney(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {["PLACED", "CONFIRMED"].includes(o.status) &&
                          o.payment?.status !== "COMPLETED" && (
                            <Button
                              className="!px-2 !py-1 text-xs"
                              loading={pay.isPending}
                              onClick={() =>
                                (window.location.href = `/dashboard/customer/orders/${o.id}/pay`)
                              }
                            >
                              Pay now
                            </Button>
                          )}
                        {["PLACED", "CONFIRMED"].includes(o.status) && (
                          <Button
                            variant="ghost"
                            className="!px-2 !py-1 text-xs"
                            loading={cancel.isPending}
                            onClick={() => cancel.mutate(o.id)}
                          >
                            Cancel
                          </Button>
                        )}
                        {o.status === "RETURNED" && !o.review && (
                          <Button
                            variant="secondary"
                            className="!px-2 !py-1 text-xs"
                            onClick={() => setReviewOrder(o)}
                          >
                            Leave review
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl uppercase">Payment history</h2>
        {payments.isLoading ? (
          <p className="mt-4 text-ink/50">Loading payments…</p>
        ) : !payments.data?.items.length ? (
          <p className="mt-4 text-ink/60">No payments yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-moss/10 bg-snow">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-moss/10 bg-mist/60 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.data.items.map((p) => (
                  <tr key={p.id} className="border-b border-moss/5">
                    <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                    <td className="px-4 py-3">{p.provider}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <form
            onSubmit={submitReview}
            className="w-full max-w-md space-y-4 rounded-xl bg-snow p-6"
          >
            <h3 className="font-display text-2xl uppercase">Leave a review</h3>
            <p className="text-sm text-ink/60">
              {reviewOrder.items?.[0]?.gearItem?.name}
            </p>
            <div>
              <Label>Rating</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Comment</Label>
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={review.isPending}>
                Submit
              </Button>
              <Button type="button" variant="ghost" onClick={() => setReviewOrder(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
