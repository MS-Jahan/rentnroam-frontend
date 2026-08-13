"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Star, MapPin, Shield, ArrowLeft, Store, Package } from "lucide-react";
import { apiClient, apiRequest, ApiError } from "@/lib/api";
import type { GearItem, RentalOrder, Paginated } from "@/lib/types";
import { formatMoney, statusBadgeClass, cn, toIsoDateStart, tapNav, tapSoft } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { GearCard } from "@/components/gear-card";
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

  const categorySlug = gearQuery.data?.category && typeof gearQuery.data.category === "object"
    ? gearQuery.data.category.slug
    : "";

  // Fetch related items in the same category
  const relatedQuery = useQuery({
    queryKey: ["related-gear", categorySlug, id],
    queryFn: () =>
      apiRequest<Paginated<GearItem>>(`/api/gear?category=${categorySlug}&limit=4`),
    enabled: !!categorySlug,
  });

  const relatedGear = useMemo(() => {
    if (!relatedQuery.data?.items) return [];
    return relatedQuery.data.items.filter((item) => item.id !== id).slice(0, 3);
  }, [relatedQuery.data, id]);

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
      toast.success("Rental order placed successfully!");
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
      toast.error("Only registered customers can place rental orders");
      return;
    }
    if (!endDate || days < 1) {
      setFormError("Rental end date must be after start date");
      return;
    }
    rent.mutate();
  }

  if (gearQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-moss/10 rounded" />
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7 h-96 rounded-2xl bg-moss/10" />
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 w-3/4 rounded bg-moss/10" />
            <div className="h-6 w-1/2 rounded bg-moss/10" />
            <div className="h-40 rounded-2xl bg-moss/10" />
          </div>
        </div>
      </div>
    );
  }

  if (gearQuery.isError || !gearQuery.data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <p className="font-semibold text-lg">Equipment Not Found</p>
          <p className="text-xs mt-1">{(gearQuery.error as Error)?.message || "Item may have been removed."}</p>
        </div>
        <Link href="/gear" className={cn("inline-flex items-center gap-1.5 text-sm font-semibold text-blaze hover:underline", tapNav)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment Catalog
        </Link>
      </div>
    );
  }

  const gear = gearQuery.data;
  const images = gear.images?.filter(Boolean) ?? [];
  const img = images[Math.min(activeImage, Math.max(images.length - 1, 0))] || images[0];
  const category =
    gear.category && "name" in gear.category ? gear.category.name : "Gear";

  const rating = gear.avgRating ? Number(gear.avgRating) : null;

  // Parse specifications JSON or object
  let specsObj: Record<string, any> = {};
  if (gear.specifications) {
    if (typeof gear.specifications === "string") {
      try {
        specsObj = JSON.parse(gear.specifications);
      } catch {
        specsObj = { Specifications: gear.specifications };
      }
    } else if (typeof gear.specifications === "object") {
      specsObj = gear.specifications;
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-12">
      {/* Back Link */}
      <div>
        <Link href="/gear" className={cn("inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-blaze transition", tapNav)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Detail Layout */}
      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Left Column: Gallery & Specifications */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
            {img ? (
              <Image src={img} alt={gear.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 60vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center topo-bg text-white">
                <span className="font-display text-5xl uppercase tracking-widest">{gear.brand}</span>
              </div>
            )}
            <span className={cn("absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-xs shadow-xs", statusBadgeClass(gear.status))}>
              {gear.status}
            </span>
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                    tapSoft,
                    i === activeImage ? "border-blaze shadow-md scale-95" : "border-line opacity-75 hover:opacity-100"
                  )}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="100px" />
                </button>
              ))}
            </div>
          )}

          {/* Specifications Table */}
          {Object.keys(specsObj).length > 0 && (
            <div className="rounded-2xl border border-line bg-panel p-6 space-y-4">
              <h3 className="font-semibold text-lg text-ink flex items-center gap-2">
                <Package className="h-5 w-5 text-blaze" />
                <span>Technical Specifications</span>
              </h3>
              <div className="rounded-xl border border-line overflow-hidden divide-y divide-line/60">
                {Object.entries(specsObj).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center p-3 text-sm hover:bg-moss/5 dark:hover:bg-snow/5">
                    <span className="font-medium text-muted capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-semibold text-ink text-right">
                      {Array.isArray(val) ? val.join(", ") : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Information & Booking Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-moss dark:text-fern">
                {category} · {gear.brand}
              </span>
              {rating !== null && rating > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{rating.toFixed(1)}</span>
                  {gear.reviewCount !== undefined && gear.reviewCount > 0 && (
                    <span className="text-muted font-normal">({gear.reviewCount} reviews)</span>
                  )}
                </div>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink leading-tight">{gear.name}</h1>

            {/* Location & Provider Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted pt-1">
              {gear.location && (
                <span className="inline-flex items-center gap-1 bg-moss/10 dark:bg-snow/10 px-2.5 py-1 rounded-full text-ink font-medium">
                  <MapPin className="h-3.5 w-3.5 text-blaze" />
                  {gear.location}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-moss/10 dark:bg-snow/10 px-2.5 py-1 rounded-full text-ink font-medium">
                <Store className="h-3.5 w-3.5 text-moss dark:text-fern" />
                {gear.provider?.name || "Local Shop"}
              </span>
              <span className="inline-flex items-center gap-1 bg-moss/10 dark:bg-snow/10 px-2.5 py-1 rounded-full text-ink font-medium">
                Stock: {gear.stock} units
              </span>
            </div>

            <p className="text-sm text-muted leading-relaxed pt-2">{gear.description}</p>

            <div className="pt-3 flex items-baseline gap-2 border-t border-line/60">
              <span className="text-3xl font-bold text-ink">{formatMoney(gear.pricePerDay)}</span>
              <span className="text-sm text-muted">/ day</span>
            </div>
          </div>

          {/* Rental Order Form */}
          <form onSubmit={onRent} className="rounded-2xl border border-line bg-panel p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-ink">Reserve Rental</h3>
              <Badge variant="outline" className="text-[11px]">Instant Confirmation</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="start" className="text-xs">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  min={today}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
              <div>
                <Label htmlFor="end" className="text-xs">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  min={startDate || today}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="mt-1 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="qty" className="text-xs">Quantity (Max {gear.stock})</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                max={gear.stock}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 rounded-xl text-xs"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-moss/5 dark:bg-snow/5 border border-line/60 space-y-1">
              <div className="flex justify-between text-xs text-muted">
                <span>Duration</span>
                <span>{days > 0 ? `${days} day(s)` : "Select dates"}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-ink pt-1 border-t border-line/40">
                <span>Estimated Total</span>
                <span className="text-blaze">{formatMoney(total)}</span>
              </div>
            </div>

            <FieldError message={formError} />

            <Button
              type="submit"
              loading={rent.isPending}
              disabled={gear.status !== "AVAILABLE" || gear.stock < 1}
              className="w-full rounded-xl py-3 font-semibold bg-blaze text-white hover:bg-blaze/90 shadow-xs"
            >
              {gear.status !== "AVAILABLE"
                ? "Currently Unavailable"
                : user
                ? "Place Rental Order"
                : "Sign In to Rent"}
            </Button>
          </form>

          {/* Security guarantee pill */}
          <div className="flex items-center gap-2 p-3.5 rounded-xl border border-line bg-panel text-xs text-muted">
            <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Encrypted Stripe Checkout. Payments held until provider confirms.</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {gear.reviews && gear.reviews.length > 0 && (
        <div className="pt-8 border-t border-line space-y-6">
          <div>
            <Badge variant="secondary">User Feedback</Badge>
            <h3 className="font-display text-2xl uppercase text-ink mt-1">Customer Reviews</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {gear.reviews.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl border border-line bg-panel space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-semibold text-ink">{r.customer?.name || "Verified Renter"}</p>
                {r.comment && <p className="text-xs text-muted leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Items Section */}
      {relatedGear.length > 0 && (
        <div className="pt-10 border-t border-line space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="default">Similar Equipment</Badge>
              <h3 className="font-display text-2xl uppercase text-ink mt-1">Related Gear</h3>
            </div>
            <Link href={`/gear?category=${categorySlug}`} className={cn("text-xs font-semibold text-blaze hover:underline", tapNav)}>
              View More in {category} →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedGear.map((item) => (
              <GearCard key={item.id} gear={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
