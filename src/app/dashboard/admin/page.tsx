"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { GearItem, Paginated, RentalOrder, User } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";

export default function AdminDashboardPage() {
  const qc = useQueryClient();
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"users" | "gear" | "rentals">("users");

  const users = useQuery({
    queryKey: ["admin-users", role],
    queryFn: () =>
      apiClient<Paginated<User>>(
        `/api/admin/users?limit=50${role ? `&role=${role}` : ""}`,
        { auth: true }
      ),
  });

  const gear = useQuery({
    queryKey: ["admin-gear"],
    queryFn: () =>
      apiClient<Paginated<GearItem>>("/api/admin/gear?limit=50", { auth: true }),
  });

  const rentals = useQuery({
    queryKey: ["admin-rentals"],
    queryFn: () =>
      apiClient<Paginated<RentalOrder>>("/api/admin/rentals?limit=50", {
        auth: true,
      }),
  });

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
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredUsers =
    users.data?.items.filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }) || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl uppercase text-ink">Admin dashboard</h1>
      <p className="mt-1 text-ink/60">Platform overview and moderation.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Users" value={String(users.data?.meta.total ?? "-")} />
        <Stat label="Gear listings" value={String(gear.data?.meta.total ?? "-")} />
        <Stat label="Rentals" value={String(rentals.data?.meta.total ?? "-")} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {(["users", "gear", "rentals"] as const).map((t) => (
          <Button
            key={t}
            variant={tab === t ? "secondary" : "ghost"}
            onClick={() => setTab(t)}
          >
            {t === "users" ? "Users" : t === "gear" ? "Gear" : "Rentals"}
          </Button>
        ))}
      </div>

      {tab === "users" && (
        <section className="mt-6">
          <div className="mb-4 flex flex-wrap gap-3">
            <Input
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="max-w-[180px]"
            >
              <option value="">All roles</option>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="PROVIDER">PROVIDER</option>
              <option value="ADMIN">ADMIN</option>
            </Select>
          </div>
          {users.isLoading ? (
            <p className="text-ink/50">Loading…</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-moss/10 bg-snow">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-moss/10 bg-mist/60 text-xs uppercase text-ink/50">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-moss/5">
                      <td className="px-4 py-3">
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-ink/50">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">{u.role}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== "ADMIN" && (
                          <Button
                            variant={u.status === "ACTIVE" ? "danger" : "secondary"}
                            className="!px-2 !py-1 text-xs"
                            loading={toggleUser.isPending}
                            onClick={() =>
                              toggleUser.mutate({
                                id: u.id,
                                status:
                                  u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                              })
                            }
                          >
                            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "gear" && (
        <section className="mt-6">
          {gear.isLoading ? (
            <p className="text-ink/50">Loading…</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-moss/10 bg-snow">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-moss/10 bg-mist/60 text-xs uppercase text-ink/50">
                  <tr>
                    <th className="px-4 py-3">Gear</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {gear.data?.items.map((g) => (
                    <tr key={g.id} className="border-b border-moss/5">
                      <td className="px-4 py-3">
                        <Link href={`/gear/${g.id}`} className="font-medium text-fern">
                          {g.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{g.provider?.name}</td>
                      <td className="px-4 py-3">{formatMoney(g.pricePerDay)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={g.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "rentals" && (
        <section className="mt-6">
          {rentals.isLoading ? (
            <p className="text-ink/50">Loading…</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-moss/10 bg-snow">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-moss/10 bg-mist/60 text-xs uppercase text-ink/50">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Provider</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals.data?.items.map((r) => (
                    <tr key={r.id} className="border-b border-moss/5">
                      <td className="px-4 py-3">{r.customer?.name}</td>
                      <td className="px-4 py-3">{r.provider?.name}</td>
                      <td className="px-4 py-3">{formatMoney(r.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-moss/10 bg-snow p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}
