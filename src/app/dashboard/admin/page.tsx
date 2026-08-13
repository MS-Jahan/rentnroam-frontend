"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { toast } from "sonner";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Search,
  Plus,
  User,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import type { GearItem, Paginated, RentalOrder, User as UserType, AdminAnalytics, Category } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Label } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/pagination";
import { ChartCard } from "@/components/ui/chart-card";
import { ProfilePasswordForm } from "@/components/profile-password-form";
import { useAuthStore } from "@/store/auth";

const PAGE_SIZE = 8;

function AdminDashboardInner() {
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();
  const qc = useQueryClient();

  const currentTab = searchParams.get("tab") || "overview";
  const [userRole, setUserRole] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const [gearPage, setGearPage] = useState(1);
  const [rentalsPage, setRentalsPage] = useState(1);

  // New Category Modal State
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Queries
  const analytics = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => apiClient<AdminAnalytics>("/api/admin/analytics", { auth: true }),
  });

  const users = useQuery({
    queryKey: ["admin-users", userRole, usersPage],
    queryFn: () =>
      apiClient<Paginated<UserType>>(
        `/api/admin/users?page=${usersPage}&limit=${PAGE_SIZE}${
          userRole ? `&role=${userRole}` : ""
        }`,
        { auth: true }
      ),
  });

  const gear = useQuery({
    queryKey: ["admin-gear", gearPage],
    queryFn: () =>
      apiClient<Paginated<GearItem>>(
        `/api/admin/gear?page=${gearPage}&limit=${PAGE_SIZE}`,
        { auth: true }
      ),
  });

  const rentals = useQuery({
    queryKey: ["admin-rentals", rentalsPage],
    queryFn: () =>
      apiClient<Paginated<RentalOrder>>(
        `/api/admin/rentals?page=${rentalsPage}&limit=${PAGE_SIZE}`,
        { auth: true }
      ),
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await apiClient<Paginated<Category>>("/api/categories");
      return data.items;
    },
  });

  // Mutations
  const toggleUser = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) =>
      apiClient(`/api/admin/users/${id}`, {
        auth: true,
        method: "PATCH",
        body: { status },
      }),
    onSuccess: () => {
      toast.success("User status updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createCategory = useMutation({
    mutationFn: () =>
      apiClient<Category>("/api/categories", {
        auth: true,
        method: "POST",
        body: {
          name: newCatName,
          slug: newCatSlug || newCatName.toLowerCase().replace(/\s+/g, "-"),
          description: newCatDesc || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Category added successfully");
      setShowAddCat(false);
      setNewCatName("");
      setNewCatSlug("");
      setNewCatDesc("");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totals = analytics.data?.totals || {
    totalUsers: users.data?.meta?.total || 0,
    totalRentals: rentals.data?.meta?.total || 0,
    totalRevenue: 0,
    totalGear: gear.data?.meta?.total || 0,
  };

  const revenueChartData = useMemo(() => {
    return (analytics.data?.revenueByMonth || []).map((m) => ({
      label: m.label,
      value: m.revenue,
    }));
  }, [analytics.data]);

  const rentalsChartData = useMemo(() => {
    return (analytics.data?.rentalsByMonth || []).map((m) => ({
      label: m.label,
      value: m.count,
    }));
  }, [analytics.data]);

  const categoryPieData = useMemo(() => {
    return (analytics.data?.gearByCategory || []).map((c) => ({
      label: c.category,
      value: c.count,
    }));
  }, [analytics.data]);

  const filteredUsers = useMemo(() => {
    return (users.data?.items || []).filter((u) => {
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [users.data, userSearch]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* TAB 1: OVERVIEW */}
      {currentTab === "overview" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Total Users</span>
                <Users className="h-5 w-5 text-blaze" />
              </div>
              <p className="font-display text-3xl text-ink">{totals.totalUsers}</p>
              <p className="text-xs text-muted">Customers, providers & admins</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Platform Gear</span>
                <Package className="h-5 w-5 text-moss dark:text-fern" />
              </div>
              <p className="font-display text-3xl text-ink">{totals.totalGear}</p>
              <p className="text-xs text-muted">Total catalog listings</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Total Rentals</span>
                <ShoppingBag className="h-5 w-5 text-amber-500" />
              </div>
              <p className="font-display text-3xl text-ink">{totals.totalRentals}</p>
              <p className="text-xs text-muted">Platform rental orders</p>
            </div>

            <div className="rounded-2xl border border-line bg-panel p-6 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-muted">Platform Volume</span>
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="font-display text-3xl text-ink">{formatMoney(totals.totalRevenue)}</p>
              <p className="text-xs text-muted">Completed transaction value</p>
            </div>
          </div>

          {/* Quick Chart View */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Platform Revenue Trend"
              description="Gross rental payments processed"
              type="line"
              data={revenueChartData}
              loading={analytics.isLoading}
              valueFormatter={(val) => `$${val}`}
            />
            <ChartCard
              title="Monthly Rental Volume"
              description="Number of rental orders placed"
              type="bar"
              data={rentalsChartData}
              loading={analytics.isLoading}
            />
          </div>
        </section>
      )}

      {/* TAB 2: MANAGE USERS */}
      {currentTab === "users" && (
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel p-4 rounded-2xl border border-line">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
                <Input
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 rounded-xl text-xs"
                />
              </div>
              <Select
                value={userRole}
                onChange={(e) => {
                  setUserRole(e.target.value);
                  setUsersPage(1);
                }}
                className="rounded-xl text-xs w-36"
              >
                <option value="">All Roles</option>
                <option value="CUSTOMER">Customer</option>
                <option value="PROVIDER">Provider</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
          </div>

          {users.isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Account</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <p className="font-semibold text-ink">{u.name}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.role === "ADMIN" ? "default" : u.role === "PROVIDER" ? "secondary" : "outline"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted">{u.phone || "—"}</TableCell>
                      <TableCell>
                        <StatusBadge status={u.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.role !== "ADMIN" && (
                          <Button
                            variant={u.status === "ACTIVE" ? "danger" : "secondary"}
                            className="!px-2.5 !py-1 text-xs"
                            loading={toggleUser.isPending}
                            onClick={() =>
                              toggleUser.mutate({
                                id: u.id,
                                status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                              })
                            }
                          >
                            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                meta={users.data?.meta}
                page={usersPage}
                onPageChange={setUsersPage}
              />
            </div>
          )}
        </section>
      )}

      {/* TAB 3: MANAGE GEAR */}
      {currentTab === "gear" && (
        <section className="space-y-6 pt-4">
          {gear.isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gear Item</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Price/Day</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gear.data?.items.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <p className="font-semibold text-ink">{g.name}</p>
                        <p className="text-xs text-muted">{g.brand}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted">{g.provider?.name || "Provider"}</TableCell>
                      <TableCell className="font-semibold text-ink">{formatMoney(g.pricePerDay)}</TableCell>
                      <TableCell className="text-xs text-muted">{g.stock} units</TableCell>
                      <TableCell>
                        <StatusBadge status={g.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/gear/${g.id}`} target="_blank">
                          <Button variant="ghost" className="!px-2.5 !py-1 text-xs">
                            View Page
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                meta={gear.data?.meta}
                page={gearPage}
                onPageChange={setGearPage}
              />
            </div>
          )}
        </section>
      )}

      {/* TAB 4: MANAGE RENTALS */}
      {currentTab === "rentals" && (
        <section className="space-y-6 pt-4">
          {rentals.isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rentals.data?.items.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs text-muted">{r.id.slice(0, 12)}</TableCell>
                      <TableCell className="text-xs font-medium text-ink">{r.customer?.name || "Customer"}</TableCell>
                      <TableCell className="text-xs text-muted">{r.provider?.name || "Provider"}</TableCell>
                      <TableCell className="text-xs text-muted">
                        {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-ink">{formatMoney(r.totalAmount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                meta={rentals.data?.meta}
                page={rentalsPage}
                onPageChange={setRentalsPage}
              />
            </div>
          )}
        </section>
      )}

      {/* TAB 5: CATEGORIES CRUD */}
      {currentTab === "categories" && (
        <section className="space-y-6 pt-4">
          <div className="flex justify-between items-center bg-panel p-4 rounded-2xl border border-line">
            <p className="text-sm font-semibold text-ink">Sport Categories Catalog</p>
            <Button onClick={() => setShowAddCat(true)} className="rounded-xl bg-blaze text-white text-xs">
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(categories.data || []).map((cat) => (
              <div key={cat.id} className="p-5 rounded-2xl border border-line bg-panel space-y-2 shadow-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-base text-ink">{cat.name}</h3>
                  <Badge variant="outline" className="text-[10px]">{cat.slug}</Badge>
                </div>
                <p className="text-xs text-muted">{cat.description || "No description provided."}</p>
                <p className="text-[11px] text-muted pt-1">ID: {cat.id}</p>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {showAddCat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xs p-4 animate-in fade-in">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createCategory.mutate();
                }}
                className="w-full max-w-md space-y-4 rounded-2xl border border-line bg-panel p-6 text-ink shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <h3 className="font-semibold text-lg text-ink">Add New Category</h3>
                  <button type="button" onClick={() => setShowAddCat(false)} className="text-muted hover:text-ink">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div>
                  <Label className="text-xs">Category Name</Label>
                  <Input
                    placeholder="e.g. Water Sports"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Slug (Optional)</Label>
                  <Input
                    placeholder="e.g. water-sports"
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    placeholder="Short summary of gear in this category"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="mt-1 rounded-xl text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" loading={createCategory.isPending} className="w-full rounded-xl bg-blaze text-white">
                    Create Category
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowAddCat(false)} className="rounded-xl">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}

      {/* TAB 6: PLATFORM ANALYTICS */}
      {currentTab === "analytics" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard
              title="Platform Revenue Growth"
              description="Monthly earnings across all providers"
              type="bar"
              data={revenueChartData}
              loading={analytics.isLoading}
              valueFormatter={(val) => `$${val}`}
            />

            <ChartCard
              title="Gear Distribution by Category"
              description="Share of listings per sport type"
              type="pie"
              data={categoryPieData}
              loading={analytics.isLoading}
            />
          </div>
        </section>
      )}

      {/* TAB 7: PROFILE & PASSWORD */}
      {currentTab === "profile" && (
        <section className="space-y-8 pt-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-panel p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 border-b border-line pb-3">
                <User className="h-5 w-5 text-blaze" />
                <h3 className="font-semibold text-lg text-ink">Admin Profile</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted block">Administrator Name</span>
                  <p className="font-semibold text-ink">{user?.name}</p>
                </div>
                <div>
                  <span className="text-xs text-muted block">Email Address</span>
                  <p className="font-semibold text-ink">{user?.email}</p>
                </div>
                <div>
                  <span className="text-xs text-muted block">Role Privilege</span>
                  <Badge variant="default" className="mt-0.5">{user?.role}</Badge>
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading admin control center...</div>}>
      <AdminDashboardInner />
    </Suspense>
  );
}
