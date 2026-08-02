"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, apiRequest } from "@/lib/api";
import type { GearItem, Paginated, RentalOrder, User } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { useMemo } from "react";

export default function ProviderDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data as User;
    },
  });

  // Workaround: no GET /api/provider/gear — filter public gear by provider name/id via orders + public list
  const publicGear = useQuery({
    queryKey: ["provider-inventory-workaround"],
    queryFn: () => apiRequest<Paginated<GearItem>>("/api/gear?limit=50"),
  });

  const orders = useQuery({
    queryKey: ["provider-orders"],
    queryFn: () =>
      apiClient<Paginated<RentalOrder>>("/api/provider/orders?limit=20", {
        auth: true,
      }),
  });

  const myGear = useMemo(() => {
    const providerId = me.data?.id || user?.id;
    const items = publicGear.data?.items || [];
    if (!providerId) return [];
    return items.filter((g) => g.providerId === providerId || g.provider?.id === providerId);
  }, [publicGear.data, me.data, user]);

  const removeGear = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/api/provider/gear/${id}`, { auth: true, method: "DELETE" }),
    onSuccess: () => {
      toast.success("Gear removed");
      qc.invalidateQueries({ queryKey: ["provider-inventory-workaround"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = orders.data?.items.filter((o) =>
    ["PLACED", "CONFIRMED", "PAID"].includes(o.status)
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase text-ink">Provider dashboard</h1>
          <p className="mt-1 text-ink/60">
            Manage inventory and fulfill rental orders.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/provider/gear/new">
            <Button>Add gear</Button>
          </Link>
          <Link href="/dashboard/provider/orders">
            <Button variant="secondary">Orders</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Gear listed" value={String(myGear.length)} />
        <Stat label="Active / pending orders" value={String(pending ?? "—")} />
        <Stat label="Total orders" value={String(orders.data?.meta.total ?? "—")} />
      </div>

      <p className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        Note: Backend has no GET /api/provider/gear. Inventory below is filtered from
        public GET /api/gear (see docs/CONFUSIONS.md). Pagination may hide older items.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-2xl uppercase">Your inventory</h2>
        {publicGear.isLoading ? (
          <p className="mt-4 text-ink/50">Loading…</p>
        ) : myGear.length === 0 ? (
          <p className="mt-4 text-ink/60">
            No gear found.{" "}
            <Link href="/dashboard/provider/gear/new" className="text-fern font-semibold">
              Add your first item
            </Link>
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-moss/10 bg-snow">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-moss/10 bg-mist/60 text-xs uppercase text-ink/50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Price/day</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myGear.map((g) => (
                  <tr key={g.id} className="border-b border-moss/5">
                    <td className="px-4 py-3 font-medium">{g.name}</td>
                    <td className="px-4 py-3">{formatMoney(g.pricePerDay)}</td>
                    <td className="px-4 py-3">{g.stock}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/provider/gear/${g.id}/edit`}>
                          <Button variant="ghost" className="!px-2 !py-1 text-xs">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          className="!px-2 !py-1 text-xs"
                          loading={removeGear.isPending}
                          onClick={() => {
                            if (confirm("Delete this gear listing?")) {
                              removeGear.mutate(g.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
