"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { toast } from "sonner";
import {
  ShoppingBag,
  CreditCard,
  Star,
  Clock,
  SlidersHorizontal,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api";
import type { Paginated, Payment, RentalOrder, Review } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ChartCard } from "@/components/ui/chart-card";
import { Pagination } from "@/components/pagination";
import { ProfilePasswordForm } from "@/components/profile-password-form";
import { useAuthStore } from "@/store/auth";

const PAGE_SIZE = 8;

function CustomerDashboardInner() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const currentTab = searchParams.get("tab") || "overview";
  const [ordersPage, setOrdersPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewOrder, setReviewOrder] = useState<RentalOrder | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Queries
  const orders = useQuery({
    queryKey: ["customer-orders", ordersPage, statusFilter],
    queryFn: () => {
      const q = new URLSearchParams({
        page: String(ordersPage),
        limit: String(PAGE_SIZE),
      });
      if (statusFilter) q.set("status", statusFilter);
      return apiClient<Paginated<RentalOrder>>(`/api/rentals?${q.toString()}`, {
        auth: true,
      });
    },
  });

  const payments = useQuery({
    queryKey: ["customer-payments", paymentsPage],
    queryFn: () =>
      apiClient<Paginated<Payment>>(
        `/api/payments?page=${paymentsPage}&limit=${PAGE_SIZE}`,
        { auth: true }
      ),
  });

  // Calculate Overview Stats
  const stats = useMemo(() => {
    const itemList = orders.data?.items || [];
    const active = itemList.filter((o) => ["CONFIRMED", "ACTIVE", "PICKED_UP"].includes(o.status)).length;
    const pending = itemList.filter((o) => o.status === "PLACED").length;
    const spent = (payments.data?.items || [])
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const reviewsCount = itemList.filter((o) => !!o.review).length;
    return { active, pending, spent, reviewsCount };
  }, [orders.data, payments.data]);

  const monthlySpendingData = useMemo(() => {
    const paymentList = payments.data?.items || [];
    const monthMap: Record<string, number> = {};
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      months.push(label);
      monthMap[label] = 0;
    }
    paymentList.forEach((p) => {
      if (p.status === "COMPLETED") {
        const d = new Date(p.createdAt);
        const label = d.toLocaleDateString("en-US", { month: "short" });
        if (monthMap[label] !== undefined) {
          monthMap[label] += Number(p.amount);
        }
      }
    });
    return months.map((label) => ({
      label,
      value: monthMap[label],
      spending: monthMap[label],
    }));
  }, [payments.data]);

  // Mutations
  const cancel = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/rentals/${id}/cancel`, { auth: true, method: "PATCH" }),
    onSuccess: () => {
      toast.success("Order cancelled successfully");
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const review = useMutation({
    mutationFn: () => {
      const gearItemId = reviewOrder?.items?.[0]?.gearItemId;
      if (!reviewOrder || !gearItemId) throw new ApiError("Missing gear details", 400);
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
      toast.success("Review submitted! Thank you for your feedback.");
      setReviewOrder(null);
      setComment("");
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleTabChange(tab: string) {
    const p = new URLSearchParams(searchParams.toString());
    p.set("tab", tab);
    router.replace(`/dashboard/customer?${p.toString()}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Customer Account</Badge>
            <span className="text-xs text-muted">ID: {user?.id?.slice(0, 8)}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink mt-1">
            Welcome back, {user?.name || "Renter"}
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage your outdoor rentals, active bookings, payment receipts, and reviews.
          </p>
        </div>
        <Link
          href="/gear"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blaze px-5 py-2.5 text-xs font-semibold text-white hover:bg-blaze/90 shadow-xs shrink-0"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Browse Gear Catalog</span>
        </Link>
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === "overview" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Active Bookings</span>
                <Clock className="h-5 w-5 text-blaze" />
              </div>
              <p className="font-display text-3xl text-ink">{stats.active}</p>
              <p className="text-xs text-muted">Confirmed or in-use gear</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Pending Action</span>
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <p className="font-display text-3xl text-ink">{stats.pending}</p>
              <p className="text-xs text-muted">Awaiting provider confirmation</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Total Spent</span>
                <CreditCard className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="font-display text-3xl text-ink">{formatMoney(stats.spent)}</p>
              <p className="text-xs text-muted">Completed Stripe payments</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Reviews Given</span>
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="font-display text-3xl text-ink">{stats.reviewsCount}</p>
              <p className="text-xs text-muted">Submitted feedback items</p>
            </div>
          </div>

          {/* Monthly Spending Chart */}
          <ChartCard
            title="Monthly Spending"
            description="Your completed rental payments over the last 6 months"
            type="bar"
            data={monthlySpendingData}
            dataKey="spending"
            nameKey="label"
            valueFormatter={(val) => formatMoney(val)}
            loading={payments.isLoading}
          />

          {/* Recent Orders Section */}
          <div className="rounded-2xl border border-line bg-panel p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-ink">Recent Rental Orders</h3>
              <button
                type="button"
                onClick={() => handleTabChange("rentals")}
                className="text-xs font-semibold text-blaze hover:underline"
              >
                View all orders →
              </button>
            </div>

            {orders.isLoading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : !orders.data?.items.length ? (
              <div className="p-8 text-center border border-dashed border-line rounded-xl text-muted text-sm space-y-2">
                <p>No rental orders placed yet.</p>
                <Link href="/gear" className="inline-block text-xs font-semibold text-blaze">
                  Start browsing sports equipment
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Rental Dates</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.data.items.slice(0, 5).map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <p className="font-semibold text-ink">
                          {o.items?.[0]?.gearItem?.name || `Order #${o.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted">{o.provider?.name}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {new Date(o.startDate).toLocaleDateString()} →{" "}
                        {new Date(o.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-ink">
                        {formatMoney(o.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {o.status === "CONFIRMED" && o.payment?.status !== "COMPLETED" && (
                          <Button
                            className="!px-3 !py-1 text-xs bg-blaze"
                            onClick={() => (window.location.href = `/dashboard/customer/orders/${o.id}/pay`)}
                          >
                            Pay Now
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: MY RENTALS */}
      {currentTab === "rentals" && (
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel p-4 rounded-2xl border border-line">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="h-4 w-4 text-muted shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setOrdersPage(1);
                }}
                className="rounded-xl border border-line bg-snow px-3 py-1.5 text-xs text-ink outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PAID">Paid</option>
                <option value="PICKED_UP">Picked Up</option>
                <option value="RETURNED">Returned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {orders.isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : !orders.data?.items.length ? (
            <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center text-muted space-y-2">
              <p className="font-semibold text-ink text-base">No orders match these criteria</p>
              <p className="text-xs">Adjust your status filter or rent new gear.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Info</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Rental Period</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.data.items.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <p className="font-semibold text-ink">
                          {o.items?.[0]?.gearItem?.name || `Order ${o.id.slice(0, 8)}`}
                        </p>
                        <p className="text-[11px] text-muted font-mono">{o.id}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {o.provider?.name || "Local Provider"}
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {new Date(o.startDate).toLocaleDateString()} – {new Date(o.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-ink">
                        {formatMoney(o.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {o.status === "CONFIRMED" && o.payment?.status !== "COMPLETED" && (
                            <Button
                              className="!px-3 !py-1 text-xs bg-blaze"
                              onClick={() => (window.location.href = `/dashboard/customer/orders/${o.id}/pay`)}
                            >
                              Pay Now
                            </Button>
                          )}
                          {["PLACED", "CONFIRMED"].includes(o.status) && (
                            <Button
                              variant="ghost"
                              className="!px-2.5 !py-1 text-xs text-red-600 hover:bg-red-50"
                              loading={cancel.isPending}
                              onClick={() => cancel.mutate(o.id)}
                            >
                              Cancel
                            </Button>
                          )}
                          {o.status === "RETURNED" && !o.review && (
                            <Button
                              variant="secondary"
                              className="!px-2.5 !py-1 text-xs"
                              onClick={() => setReviewOrder(o)}
                            >
                              Leave Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                meta={orders.data.meta}
                page={ordersPage}
                onPageChange={setOrdersPage}
              />
            </div>
          )}
        </section>
      )}

      {/* TAB 3: PAYMENT HISTORY */}
      {currentTab === "payments" && (
        <section className="space-y-6 pt-4">
          {payments.isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : !payments.data?.items.length ? (
            <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center text-muted">
              No payment transactions found.
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Stripe Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.data.items.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted">{p.id.slice(0, 12)}</TableCell>
                      <TableCell className="font-semibold text-ink">{formatMoney(p.amount)}</TableCell>
                      <TableCell className="text-xs text-muted">{p.provider}</TableCell>
                      <TableCell className="font-mono text-xs text-muted">{p.stripePaymentIntentId || "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {new Date(p.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                meta={payments.data.meta}
                page={paymentsPage}
                onPageChange={setPaymentsPage}
              />
            </div>
          )}
        </section>
      )}

      {/* TAB 4: PROFILE & PASSWORD */}
      {currentTab === "profile" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-panel p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <User className="h-5 w-5 text-blaze" />
                <h3 className="font-semibold text-lg text-ink">Account Profile</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted block">Full Name</span>
                  <p className="font-semibold text-ink">{user?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted block">Email Address</span>
                  <p className="font-semibold text-ink">{user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted block">Phone</span>
                  <p className="font-semibold text-ink">{user?.phone || "Not specified"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted block">Account Role</span>
                  <Badge variant="secondary" className="mt-0.5">{user?.role}</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs">
              <ProfilePasswordForm />
            </div>
          </div>
        </section>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-in fade-in">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              review.mutate();
            }}
            className="w-full max-w-md space-y-4 rounded-2xl border border-line bg-panel p-6 text-ink shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-semibold text-lg text-ink">Write a Review</h3>
              <button type="button" onClick={() => setReviewOrder(null)} className="text-muted hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted">
              Sharing feedback for <span className="font-semibold text-ink">{reviewOrder.items?.[0]?.gearItem?.name}</span>
            </p>

            <div>
              <Label className="text-xs">Rating (1 to 5 Stars)</Label>
              <div className="flex gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 transition hover:scale-110"
                  >
                    <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-500" : "text-muted"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Comment</Label>
              <Textarea
                rows={3}
                placeholder="How was the equipment condition and performance during your trip?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" loading={review.isPending} className="w-full rounded-xl bg-blaze text-white">
                Submit Feedback
              </Button>
              <Button type="button" variant="ghost" onClick={() => setReviewOrder(null)} className="rounded-xl">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading customer dashboard...</div>}>
      <CustomerDashboardInner />
    </Suspense>
  );
}
