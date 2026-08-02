import Link from "next/link";
import Image from "next/image";
import type { GearItem } from "@/lib/types";
import { formatMoney, statusBadgeClass, cn } from "@/lib/utils";

export function GearCard({ gear }: { gear: GearItem }) {
  const img = gear.images?.[0];
  const category =
    gear.category && "name" in gear.category ? gear.category.name : "Gear";

  return (
    <Link
      href={`/gear/${gear.id}`}
      className="group block overflow-hidden rounded-xl border border-moss/10 bg-snow shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-moss/5">
        {img ? (
          <Image
            src={img}
            alt={gear.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#2D6A4F33,transparent_55%),linear-gradient(135deg,#0B1F17,#1B4332)]">
            <span className="font-display text-3xl uppercase tracking-widest text-white/80">
              {gear.brand.slice(0, 1)}
            </span>
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold",
            statusBadgeClass(gear.status)
          )}
        >
          {gear.status}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-fern">
          {category} · {gear.brand}
        </p>
        <h3 className="font-display text-xl uppercase leading-tight text-ink">
          {gear.name}
        </h3>
        <p className="text-sm text-ink/60 line-clamp-2">{gear.description}</p>
        <p className="pt-2 text-lg font-semibold text-ink">
          {formatMoney(gear.pricePerDay)}
          <span className="text-sm font-normal text-ink/50"> / day</span>
        </p>
      </div>
    </Link>
  );
}

export function GearCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-moss/10 bg-snow">
      <div className="aspect-[4/3] bg-moss/10" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-24 rounded bg-moss/10" />
        <div className="h-5 w-3/4 rounded bg-moss/10" />
        <div className="h-4 w-full rounded bg-moss/10" />
        <div className="h-6 w-28 rounded bg-moss/10" />
      </div>
    </div>
  );
}
