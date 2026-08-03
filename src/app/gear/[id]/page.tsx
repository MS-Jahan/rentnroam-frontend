"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { apiClient, apiRequest, ApiError } from "@/lib/api";
import type { GearItem, RentalOrder } from "@/lib/types";
import { formatMoney, statusBadgeClass, cn, toIsoDateStart } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/field";
import { useAuthStore } from "@/store/auth";
import { differenceInCalendarDays, formatISO, startOfToday } from "date-fns";

export default function GearDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const today = formatISO(startOfToday(), { representation: "date" });
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [formError, setFormError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const gearQuery = useQuery({
    queryKey: ["gear", id],
    queryFn: () => apiRequest<GearItem>(`/api/gear/${id}`),
  });

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const d = differenceInCalendarDays(new Date(endDate), new Date(startDate));
    return d > 0 ? d : 0;
  }, [startDate, endDate]);

  const total = useMemo(() => {
    const price = Number(gearQuery.data?.pricePerDay || 0);
    return price * quantity * days;
  }, [gearQuery.data, quantity, days]);

  const rent = useMutation({
    mutationFn: () =>
      apiClient<RentalOrder>("/api/rentals", {
        auth: true,
        method: "POST",
        body: {
          items: [{ gearItemId: id, quantity }],
          startDate: toIsoDateStart(startDate),
          endDate: toIsoDateStart(endDate),
        },
      }),
    onSuccess: (order) => {
      toast.success("Rental order placed");
      router.push(`/dashboard/customer?highlight=${order.id}`);
    },
    onError: (err: Error) => {
      const msg = err instanceof ApiError ? err.message : err.message;
      setFormError(msg);
      toast.error(msg);
    },
  });

  function onRent(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!user) {
      router.push(`/auth/login?next=/gear/${id}`);
      return;
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only customers can rent gear");
      return;
    }
    if (!endDate || days < 1) {
      setFormError("End date must be after start date");
      return;
    }
    rent.mutate();
  }

  if (gearQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse px-4 py-10">
        <div className="h-80 rounded-xl bg-moss/10" />
      </div>
    );
  }

  if (gearQuery.isError || !gearQuery.data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-red-600">
          {(gearQuery.error as Error)?.message || "Gear not found"}
        </p>
        <Link href="/gear" className="mt-4 inline-block text-fern">
          Back to browse
        </Link>
      </div>
    );
  }

  const gear = gearQuery.data;
  const images = gear.images?.filter(Boolean) ?? [];
  const img = images[Math.min(activeImage, Math.max(images.length - 1, 0))] || images[0];
  const category =
    gear.category && "name" in gear.category ? gear.category.name : "Gear";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-moss/10">
            {img ? (
              <Image src={img} alt={gear.name} fill className="object-cover" sizes="50vw" />
            ) : (
              <div className="flex h-full items-center justify-center topo-bg text-white">
                <span className="font-display text-6xl uppercase">{gear.brand}</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2",
                    i === activeImage ? "border-fern" : "border-transparent"
                  )}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-fern">
            {category} · {gear.brand}
          </p>
          <h1 className="mt-2 font-display text-4xl uppercase text-ink">{gear.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", statusBadgeClass(gear.status))}>
              {gear.status}
            </span>
            <span className="text-sm text-ink/60">Stock: {gear.stock}</span>
            {gear.provider && (
              <span className="text-sm text-ink/60">Provider: {gear.provider.name}</span>
            )}
          </div>
          <p className="mt-4 text-ink/70">{gear.description}</p>
          <p className="mt-6 text-3xl font-semibold text-ink">
            {formatMoney(gear.pricePerDay)}
            <span className="text-base font-normal text-ink/50"> / day</span>
          </p>

          <form onSubmit={onRent} className="mt-8 space-y-4 rounded-xl border border-moss/10 bg-snow p-5">
            <h2 className="font-display text-2xl uppercase">Rent now</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="start">Start date</Label>
                <Input
                  id="start"
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end">End date</Label>
                <Input
                  id="end"
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                max={gear.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <p className="text-sm text-ink/70">
              {days > 0
                ? `${days} day(s) · Estimated total ${formatMoney(total)}`
                : "Select an end date after the start date."}
            </p>
            <FieldError message={formError} />
            <Button type="submit" loading={rent.isPending} className="w-full">
              {user ? "Place rental order" : "Sign in to rent"}
            </Button>
          </form>

          {gear.reviews && gear.reviews.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-xl uppercase">Recent reviews</h3>
              <ul className="mt-3 space-y-3">
                {gear.reviews.map((r) => (
                  <li key={r.id} className="rounded-lg border border-moss/10 bg-snow p-3 text-sm">
                    <p className="font-semibold">
                      {r.rating}/5 · {r.customer?.name || "Customer"}
                    </p>
                    {r.comment && <p className="mt-1 text-ink/70">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
