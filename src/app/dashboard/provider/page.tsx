"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { toast } from "sonner";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Star,
  Plus,
  Edit,
  Trash2,
  User,
  SlidersHorizontal,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
} from "lucide-react";
import { apiClient, fetchCategoryItems } from "@/lib/api";
import type { GearItem, GearStatus, Paginated, RentalOrder, ProviderAnalytics, Category } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/pagination";
import { ChartCard } from "@/components/ui/chart-card";
import { ProfilePasswordForm } from "@/components/profile-password-form";
import { useAuthStore } from "@/store/auth";

const PAGE_SIZE = 8;

function ProviderDashboardInner() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const currentTab = searchParams.get("tab") || "overview";
  const [gearPage, setGearPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  // Provider Analytics query
  const analytics = useQuery({
    queryKey: ["provider-analytics"],
    queryFn: () => apiClient<ProviderAnalytics>("/api/provider/analytics", { auth: true }),
  });

  // Gear Inventory query
  const inventory = useQuery({
    queryKey: ["provider-gear", gearPage],
    queryFn: () =>
      apiClient<Paginated<GearItem>>(
        `/api/provider/gear?page=${gearPage}&limit=${PAGE_SIZE}`,
        { auth: true }
      ),
  });

  // Provider Orders query
  const orders = useQuery({
    queryKey: ["provider-orders", ordersPage, orderStatusFilter],
    queryFn: () => {
      const q = new URLSearchParams({
        page: String(ordersPage),
        limit: String(PAGE_SIZE),
      });
      if (orderStatusFilter) q.set("status", orderStatusFilter);
      return apiClient<Paginated<RentalOrder>>(`/api/provider/orders?${q.toString()}`, {
        auth: true,
      });
    },
  });

  // Categories query
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategoryItems(),
  });

  // Gear Status Mutation
  const setAvailability = useMutation({
    mutationFn: ({ id, status }: { id: string; status: GearStatus }) =>
      apiClient<GearItem>(`/api/provider/gear/${id}`, {
        auth: true,
        method: "PUT",
        body: { status },
      }),
    onSuccess: () => {
      toast.success("Gear status updated");
      qc.invalidateQueries({ queryKey: ["provider-gear"] });
      qc.invalidateQueries({ queryKey: ["provider-analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Order Status Mutation
  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient<RentalOrder>(`/api/provider/orders/${id}`, {
        auth: true,
        method: "PATCH",
        body: { status },
      }),
    onSuccess: () => {
      toast.success("Order status updated");
      qc.invalidateQueries({ queryKey: ["provider-orders"] });
      qc.invalidateQueries({ queryKey: ["provider-analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Delete Gear Mutation
  const removeGear = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/provider/gear/${id}`, {
        auth: true,
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Gear listing removed");
      qc.invalidateQueries({ queryKey: ["provider-gear"] });
      qc.invalidateQueries({ queryKey: ["provider-analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totals = analytics.data?.totals || {
    totalRevenue: 0,
    totalOrders: 0,
    activeListings: 0,
    avgRating: 0,
  };

  const revenueChartData = useMemo(() => {
    return (analytics.data?.monthlyRevenue || []).map((m) => ({
      label: m.label,
      value: m.revenue,
    }));
  }, [analytics.data]);

  const ordersPieData = useMemo(() => {
    return (analytics.data?.ordersByStatus || []).map((s) => ({
      label: s.status,
      value: s.count,
    }));
  }, [analytics.data]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* TAB 1: OVERVIEW */}
      {currentTab === "overview" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Total Revenue</span>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="font-display text-3xl text-ink">{formatMoney(totals.totalRevenue)}</p>
              <p className="text-xs text-muted">From completed rentals</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Active Listings</span>
                <Package className="h-5 w-5 text-blaze" />
              </div>
              <p className="font-display text-3xl text-ink">{totals.activeListings}</p>
              <p className="text-xs text-muted">Gear items in shop</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Total Orders</span>
                <ShoppingBag className="h-5 w-5 text-moss dark:text-fern" />
              </div>
              <p className="font-display text-3xl text-ink">{totals.totalOrders}</p>
              <p className="text-xs text-muted">All customer orders</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Shop Rating</span>
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="font-display text-3xl text-ink">
                {totals.avgRating > 0 ? totals.avgRating.toFixed(1) : "N/A"}
              </p>
              <p className="text-xs text-muted">Avg customer rating</p>
            </div>
          </div>

          {/* Revenue Chart */}
          <ChartCard
            title="Monthly Revenue Trend"
            description="Completed rental payments over the last 6 months"
            type="line"
            data={revenueChartData}
            loading={analytics.isLoading}
            valueFormatter={(val) => `$${val}`}
          />
        </section>
      )}

      {/* TAB 2: MANAGE GEAR */}
      {currentTab === "inventory" && (
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-panel p-4 rounded-2xl border border-line">
            <p className="text-sm font-semibold text-ink">
              Your Gear Inventory ({inventory.data?.meta?.total || 0} items)
            </p>
            <Link href="/dashboard/provider/gear/new">
              <Button className="rounded-xl bg-blaze text-white text-xs">
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </Link>
          </div>

          {inventory.isLoading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : !inventory.data?.items.length ? (
            <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center text-muted space-y-2">
              <p className="font-semibold text-ink text-base">No gear listed yet</p>
              <p className="text-xs">List your equipment to start receiving rental requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.data.items.map((g) => {
                    const nextStatus: GearStatus =
                      g.status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE";
                    return (
                      <TableRow key={g.id}>
                        <TableCell>
                          <p className="font-semibold text-ink">{g.name}</p>
                          <p className="text-xs text-muted">{g.brand}</p>
                        </TableCell>
                        <TableCell className="text-xs text-muted">
                          {g.location || "Default Location"}
                        </TableCell>
                        <TableCell className="font-semibold text-ink">
                          {formatMoney(g.pricePerDay)}
                        </TableCell>
                        <TableCell className="text-xs text-ink font-medium">
                          {g.stock} units
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={g.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/provider/gear/${g.id}/edit`}>
                              <Button variant="ghost" className="!px-2.5 !py-1 text-xs">
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Button>
                            </Link>
                            <Button
                              variant="secondary"
                              className="!px-2.5 !py-1 text-xs"
                              loading={setAvailability.isPending}
                              onClick={() =>
                                setAvailability.mutate({ id: g.id, status: nextStatus })
                              }
                            >
                              {g.status === "AVAILABLE" ? "Mark Unavailable" : "Mark Available"}
                            </Button>
                            <Button
                              variant="danger"
                              className="!px-2.5 !py-1 text-xs"
                              loading={removeGear.isPending}
                              onClick={() => {
                                if (confirm("Permanently delete this gear listing?")) {
                                  removeGear.mutate(g.id);
                                }
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Pagination
                meta={inventory.data.meta}
                page={gearPage}
                onPageChange={setGearPage}
              />
            </div>
          )}
        </section>
      )}

      {/* TAB 3: MANAGE ORDERS */}
      {currentTab === "orders" && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between bg-panel p-4 rounded-2xl border border-line">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted" />
              <select
                value={orderStatusFilter}
                onChange={(e) => {
                  setOrderStatusFilter(e.target.value);
                  setOrdersPage(1);
                }}
                className="rounded-xl border border-line bg-snow px-3 py-1.5 text-xs text-ink outline-none"
              >
                <option value="">All Order Statuses</option>
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
            <TableSkeleton rows={6} cols={6} />
          ) : !orders.data?.items.length ? (
            <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center text-muted">
              No orders found for this filter.
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Fulfillment Actions</TableHead>
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
                        {o.customer?.name || "Customer"}
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
                        <div className="flex justify-end gap-1.5">
                          {o.status === "PLACED" && (
                            <Button
                              className="!px-2.5 !py-1 text-xs bg-moss text-white hover:bg-fern"
                              onClick={() => updateOrderStatus.mutate({ id: o.id, status: "CONFIRMED" })}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Confirm</span>
                            </Button>
                          )}
                          {o.status === "PAID" && (
                            <Button
                              className="!px-2.5 !py-1 text-xs bg-blaze text-white"
                              onClick={() => updateOrderStatus.mutate({ id: o.id, status: "PICKED_UP" })}
                            >
                              <Truck className="h-3.5 w-3.5" />
                              <span>Mark Picked Up</span>
                            </Button>
                          )}
                          {o.status === "PICKED_UP" && (
                            <Button
                              variant="secondary"
                              className="!px-2.5 !py-1 text-xs"
                              onClick={() => updateOrderStatus.mutate({ id: o.id, status: "RETURNED" })}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              <span>Mark Returned</span>
                            </Button>
                          )}
                          {["PLACED", "CONFIRMED"].includes(o.status) && (
                            <Button
                              variant="ghost"
                              className="!px-2 !py-1 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => updateOrderStatus.mutate({ id: o.id, status: "CANCELLED" })}
                            >
                              <XCircle className="h-3.5 w-3.5" />
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

      {/* TAB 4: REVENUE ANALYTICS */}
      {currentTab === "analytics" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Revenue Breakdown"
              description="Monthly earnings over 6 months"
              type="bar"
              data={revenueChartData}
              loading={analytics.isLoading}
              valueFormatter={(val) => `$${val}`}
            />

            <ChartCard
              title="Orders Distribution"
              description="Breakdown of order statuses"
              type="pie"
              data={ordersPieData}
              loading={analytics.isLoading}
            />
          </div>

          {/* Top Gear Performance Table */}
          <div className="rounded-2xl border border-line bg-panel p-6 space-y-4 shadow-xs">
            <h3 className="font-semibold text-lg text-ink">Top Performing Equipment</h3>
            {!analytics.data?.topGear?.length ? (
              <p className="text-xs text-muted">No gear performance data available yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gear Item</TableHead>
                    <TableHead>Total Orders</TableHead>
                    <TableHead>Revenue Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.data.topGear.map((g) => (
                    <TableRow key={g.gearItemId}>
                      <TableCell className="font-semibold text-ink">{g.name}</TableCell>
                      <TableCell className="text-xs text-muted">{g.totalOrders} rentals</TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(g.totalRevenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>
      )}

      {/* TAB 5: CATEGORIES Catalog */}
      {currentTab === "categories" && (
        <section className="space-y-6 pt-4">
          <div className="rounded-2xl border border-line bg-panel p-6 space-y-4 shadow-xs">
            <h3 className="font-semibold text-lg text-ink">Sport Categories</h3>
            <p className="text-xs text-muted">Categories available for listing gear on RentNRoam.</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(categories.data || []).map((cat) => (
                <div key={cat.id} className="p-4 rounded-xl border border-line bg-moss/5 dark:bg-snow/5 space-y-1">
                  <p className="font-semibold text-ink text-base">{cat.name}</p>
                  <p className="text-xs text-muted">{cat.description || "Sport category"}</p>
                  <span className="inline-block text-[11px] font-mono text-muted pt-1">Slug: {cat.slug}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TAB 6: PROFILE & PASSWORD */}
      {currentTab === "profile" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-panel p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <User className="h-5 w-5 text-blaze" />
                <h3 className="font-semibold text-lg text-ink">Provider Profile</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted block">Shop / Business Name</span>
                  <p className="font-semibold text-ink">{user?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted block">Email Address</span>
                  <p className="font-semibold text-ink">{user?.email}</p>
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
    </div>
  );
}

export default function ProviderDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading provider dashboard...</div>}>
      <ProviderDashboardInner />
    </Suspense>
  );
}
