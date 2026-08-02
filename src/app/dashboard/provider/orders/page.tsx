"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import type { Paginated, RentalOrder, RentalStatus } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

const NEXT_ACTIONS: Partial<
  Record<RentalStatus, { label: string; status: RentalStatus }[]>
> = {
  PLACED: [
    { label: "Confirm", status: "CONFIRMED" },
    { label: "Cancel", status: "CANCELLED" },
  ],
  CONFIRMED: [{ label: "Cancel", status: "CANCELLED" }],
  PAID: [{ label: "Mark picked up", status: "PICKED_UP" }],
  PICKED_UP: [{ label: "Mark returned", status: "RETURNED" }],
};

export default function ProviderOrdersPage() {
  const qc = useQueryClient();

  const orders = useQuery({
    queryKey: ["provider-orders"],
    queryFn: () =>
      apiClient<Paginated<RentalOrder>>("/api/provider/orders?limit=30", {
        auth: true,
      }),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RentalStatus }) =>
      apiClient(`/api/provider/orders/${id}`, {
        auth: true,
        method: "PATCH",
        body: { status },
      }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["provider-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl uppercase text-ink">Incoming orders</h1>
      <p className="mt-1 text-ink/60">Confirm, fulfill, and mark returns.</p>

      {orders.isLoading ? (
        <p className="mt-8 text-ink/50">Loading…</p>
      ) : orders.isError ? (
        <p className="mt-8 text-red-600">{(orders.error as Error).message}</p>
      ) : !orders.data?.items.length ? (
        <p className="mt-8 text-ink/60">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-moss/10 bg-snow">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-moss/10 bg-mist/60 text-xs uppercase text-ink/50">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Gear</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.data.items.map((o) => (
                <tr key={o.id} className="border-b border-moss/5">
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer?.name}</p>
                    <p className="text-xs text-ink/50">{o.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {o.items?.map((i) => i.gearItem?.name).join(", ")}
                  </td>
                  <td className="px-4 py-3">{formatMoney(o.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {(NEXT_ACTIONS[o.status] || []).map((a) => (
                        <Button
                          key={a.status}
                          variant={a.status === "CANCELLED" ? "danger" : "secondary"}
                          className="!px-2 !py-1 text-xs"
                          loading={update.isPending}
                          onClick={() =>
                            update.mutate({ id: o.id, status: a.status })
                          }
                        >
                          {a.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
