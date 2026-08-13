import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ArrowRight } from "lucide-react";
import type { GearItem } from "@/lib/types";
import { formatMoney, statusBadgeClass, cn, tapCard } from "@/lib/utils";

export function GearCard({ gear }: { gear: GearItem }) {
  const img = gear.images?.[0];
  const category =
    gear.category && "name" in gear.category ? gear.category.name : "Gear";

  const rating = gear.avgRating ? Number(gear.avgRating) : null;

  return (
    <Link
      href={`/gear/${gear.id}`}
      className={cn(
        "group flex flex-col h-full overflow-hidden rounded-xl border border-line bg-panel shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md",
        tapCard
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-moss/5">
        {img ? (
          <Image
            src={img}
            alt={gear.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#2D6A4F33,transparent_55%),linear-gradient(135deg,#0B1F17,#1B4332)]">
            <span className="font-display text-4xl uppercase tracking-widest text-white/80">
              {gear.brand.slice(0, 1)}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs shadow-xs",
              statusBadgeClass(gear.status)
            )}
          >
            {gear.status}
          </span>
        </div>
        {gear.location && (
          <div className="absolute right-3 bottom-3 z-10 flex items-center gap-1 rounded-full bg-ink/75 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-medium text-white shadow-xs">
            <MapPin className="h-3 w-3 text-blaze" />
            <span className="truncate max-w-[120px]">{gear.location.split(",")[0]}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-moss dark:text-fern">
              {category} · {gear.brand}
            </span>
            {rating !== null && rating > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>{rating.toFixed(1)}</span>
                {gear.reviewCount !== undefined && gear.reviewCount > 0 && (
                  <span className="text-muted font-normal">({gear.reviewCount})</span>
                )}
              </div>
            )}
          </div>
          <h3 className="font-semibold text-lg text-ink line-clamp-1 group-hover:text-blaze transition-colors">
            {gear.name}
          </h3>
          <p className="text-xs text-muted line-clamp-2 leading-relaxed">{gear.description}</p>
        </div>

        <div className="pt-2 border-t border-line/60 flex items-center justify-between mt-auto">
          <div>
            <span className="text-xs text-muted block">Price</span>
            <p className="text-base font-bold text-ink">
              {formatMoney(gear.pricePerDay)}
              <span className="text-xs font-normal text-muted"> / day</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blaze group-hover:translate-x-1 transition-transform">
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function GearCardSkeleton() {
  return (
    <div className="animate-pulse flex flex-col h-full overflow-hidden rounded-xl border border-line bg-panel shadow-xs">
      <div className="aspect-[4/3] w-full bg-moss/10" />
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-moss/10" />
          <div className="h-5 w-3/4 rounded bg-moss/10" />
          <div className="h-4 w-full rounded bg-moss/10" />
        </div>
        <div className="pt-3 border-t border-line/60 flex justify-between items-center">
          <div className="h-6 w-24 rounded bg-moss/10" />
          <div className="h-4 w-20 rounded bg-moss/10" />
        </div>
      </div>
    </div>
  );
}
