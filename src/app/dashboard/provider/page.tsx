"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { GearItem, Paginated, RentalOrder } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";

export default function ProviderDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const inventory = useQuery({
    queryKey: ["provider-gear"],
    queryFn: () =>
      apiClient<Paginated<GearItem>>("/api/provider/gear?limit=50", {
        auth: true,
      }),
  });

  const orders = useQuery({
    queryKey: ["provider-orders"],
    queryFn: () =>
      apiClient<Paginated<RentalOrder>>("/api/provider/orders?limit=20", {
        auth: true,
      }),
  });

  const myGear = inventory.data?.items ?? [];

  const removeGear = useMutation({
    mutationFn: (id: string) =>
      apiClient<{ status?: string } | null>(`/api/provider/gear/${id}`, {
        auth: true,
        method: "DELETE",
      }),
    onSuccess: (data) => {
      const markedUnavailable =
        data && typeof data === "object" && "status" in data && data.status === "UNAVAILABLE";
      toast.success(
        markedUnavailable
          ? "Gear marked unavailable (has rental history)"
          : "Gear removed"
      );
      qc.invalidateQueries({ queryKey: ["provider-gear"] });
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
          <h1 className="font-display text-4xl uppercase text-ink">
            Provider dashboard
          </h1>
          <p className="mt-1 text-ink/60">
            Manage inventory and fulfill rental orders
            {user ? ` - ${user.name}` : ""}.
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
        <Stat label="Gear listed" value={String(inventory.data?.meta.total ?? myGear.length)} />
        <Stat label="Active / pending orders" value={String(pending ?? "-")} />
        <Stat label="Total orders" value={String(orders.data?.meta.total ?? "-")} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-2xl uppercase">Your inventory</h2>
        {inventory.isLoading ? (
          <p className="mt-4 text-ink/50">Loading…</p>
        ) : inventory.isError ? (
          <p className="mt-4 text-red-600">{(inventory.error as Error).message}</p>
        ) : myGear.length === 0 ? (
          <p className="mt-4 text-ink/60">
            No gear yet.{" "}
            <Link
              href="/dashboard/provider/gear/new"
              className="font-semibold text-fern"
            >
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
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
    </div>
  );
}
