import Link from "next/link";
import { apiRequest } from "@/lib/api";
import type { GearItem, Paginated } from "@/lib/types";
import { GearCard } from "@/components/gear-card";

export default async function HomePage() {
  let featured: GearItem[] = [];
  try {
    const data = await apiRequest<Paginated<GearItem>>(
      "/api/gear?available=true&limit=6&sort=newest"
    );
    featured = data.items;
  } catch {
    featured = [];
  }

  return (
    <div>
      <section className="topo-bg relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-[1.2fr_0.8fr] md:items-end md:py-28">
          <div>
            <p className="animate-rise font-display text-5xl uppercase leading-none tracking-wide md:text-7xl">
              Gear<span className="text-blaze">Up</span>
            </p>
            <h1 className="animate-rise-delay mt-4 max-w-xl font-display text-3xl uppercase leading-tight text-white/95 md:text-4xl">
              Rent trail-ready gear by the day
            </h1>
            <p className="animate-rise-delay mt-4 max-w-lg text-base text-white/75 md:text-lg">
              Bikes, boards, tents, and climbing kits from local providers - pick
              dates, pay securely, hit the trail.
            </p>
            <div className="animate-rise-delay mt-8 flex flex-wrap gap-3">
              <Link
                href="/gear"
                className="rounded-md bg-blaze px-5 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-blaze/90"
              >
                Browse gear
              </Link>
              <Link
                href="/auth/register"
                className="rounded-md border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                List your inventory
              </Link>
            </div>
          </div>
          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blaze">
              How it works
            </p>
            <ol className="mt-4 space-y-3 text-sm text-white/80">
              <li>1. Find gear by category, brand, and price</li>
              <li>2. Choose rental dates and place an order</li>
              <li>3. Pay with Stripe when the provider confirms</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl uppercase text-ink">Featured gear</h2>
            <p className="mt-1 text-ink/60">Ready to rent this week.</p>
          </div>
          <Link href="/gear" className="text-sm font-semibold text-fern hover:text-moss">
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="rounded-lg border border-dashed border-moss/20 bg-snow p-8 text-center text-ink/60">
            No gear available right now. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GearCard key={g.id} gear={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
