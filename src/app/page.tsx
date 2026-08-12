import Link from "next/link";
import {
  Compass,
  Shield,
  Zap,
  Clock,
  Star,
  Users,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { GearItem, Category, Paginated } from "@/lib/types";
import { GearCard } from "@/components/gear-card";
import { HomeFaq } from "@/components/home-faq";
import { HomeNewsletter } from "@/components/home-newsletter";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  let featured: GearItem[] = [];
  let categories: Category[] = [];

  try {
    const gearData = await apiRequest<Paginated<GearItem>>(
      "/api/gear?available=true&limit=6&sort=newest"
    );
    featured = gearData.items;
  } catch {
    featured = [];
  }

  try {
    categories = await apiRequest<Category[]>("/api/categories");
  } catch {
    categories = [];
  }

  const categoryIcons: Record<string, string> = {
    camping: "⛺",
    cycling: "🚴",
    "water-sports": "🚣",
    climbing: "🧗",
    fitness: "🏋️",
  };

  const testimonials = [
    {
      name: "Rahim Khan",
      role: "Outdoor Enthusiast",
      comment:
        "The 4-Person Camping Tent was spacious and survived two rainy nights at Sajek. Drying and packing took no time.",
      rating: 5,
      gear: "4-Person Camping Tent",
      avatar: "RK",
    },
    {
      name: "Alex Rahman",
      role: "Trail Rider",
      comment:
        "Mountain Bike Pro 29 handled the Chattogram hill trails well. Picked up directly from provider, smooth experience!",
      rating: 5,
      gear: "Mountain Bike Pro 29",
      avatar: "AR",
    },
    {
      name: "Sara Islam",
      role: "Water Sports Lover",
      comment:
        "The Stand-Up Paddleboard 10'6 was perfectly stable even with a beginner. The pump and bag made transport easy.",
      rating: 5,
      gear: "Stand-Up Paddleboard 10'6",
      avatar: "SI",
    },
  ];

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* SECTION 1: HERO */}
      <section className="topo-bg relative min-h-[60vh] max-h-[70vh] flex items-center overflow-hidden text-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blaze/40 bg-blaze/10 px-3.5 py-1 text-xs font-semibold text-blaze backdrop-blur-md animate-rise">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Trail-Ready Sports Equipment Rental</span>
            </div>
            
            <h1 className="animate-rise-delay font-display text-4xl uppercase leading-none tracking-tight sm:text-6xl md:text-7xl">
              Rent Premium Gear. <br />
              <span className="text-blaze">Own the Adventure.</span>
            </h1>

            <p className="animate-rise-delay max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed">
              Bikes, kayaks, tents, and climbing kits from verified local shop owners. Pick dates, pay securely via Stripe, and hit the outdoors.
            </p>

            <div className="animate-rise-delay pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/gear"
                className="inline-flex items-center gap-2 rounded-xl bg-blaze px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-blaze/90 hover:shadow-blaze/20"
              >
                <span>Browse All Gear</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <span>Become a Provider</span>
              </Link>
            </div>

            {/* Quick stats ticker inside hero */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg">
              <div>
                <p className="font-display text-2xl text-blaze">15+</p>
                <p className="text-xs text-white/70">Verified Gear Items</p>
              </div>
              <div>
                <p className="font-display text-2xl text-white">5</p>
                <p className="text-xs text-white/70">Sport Categories</p>
              </div>
              <div>
                <p className="font-display text-2xl text-emerald-400">4.9★</p>
                <p className="text-xs text-white/70">Avg User Rating</p>
              </div>
            </div>
          </div>

          {/* Interactive Category Teaser Grid */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-blaze">
                  Popular Categories
                </span>
                <span className="text-xs text-white/60">Live Inventory</span>
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "Camping & Outdoor", count: "5 items", icon: "⛺" },
                  { name: "Cycling & Mountain Bikes", count: "3 items", icon: "🚴" },
                  { name: "Water Sports & Kayaks", count: "4 items", icon: "🚣" },
                  { name: "Climbing & Harnesses", count: "2 items", icon: "🧗" },
                  { name: "Fitness & Training", count: "2 items", icon: "🏋️" },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href="/gear"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/15 transition border border-white/10 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm font-semibold text-white group-hover:text-blaze transition">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-white/60 bg-white/10 px-2.5 py-1 rounded-full">
                      {item.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED GEAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge variant="default" className="mb-2">Verified Inventory</Badge>
            <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">Featured Gear</h2>
            <p className="mt-1 text-sm text-muted">Ready for immediate pickup and rental today.</p>
          </div>
          <Link
            href="/gear"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blaze hover:underline"
          >
            <span>Explore full catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="rounded-2xl border border-line bg-panel p-12 text-center space-y-3">
            <p className="text-muted text-base">No featured gear items available right now.</p>
            <Link href="/gear" className="inline-block text-sm font-semibold text-blaze">Browse all listings</Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GearCard key={g.id} gear={g} />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: CATEGORIES GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-2">Explore By Sport</Badge>
          <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">Gear Categories</h2>
          <p className="mt-2 text-sm text-muted">
            Find specialized equipment designed for every outdoor activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/gear?category=${cat.slug}`}
              className="group flex flex-col items-center text-center p-6 rounded-2xl border border-line bg-panel transition-all duration-200 hover:-translate-y-1 hover:border-blaze/40 hover:shadow-md"
            >
              <div className="h-16 w-16 rounded-2xl bg-moss/10 dark:bg-snow/10 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                {categoryIcons[cat.slug] || "⚽"}
              </div>
              <h3 className="font-semibold text-base text-ink group-hover:text-blaze transition">
                {cat.name}
              </h3>
              <p className="text-xs text-muted mt-1 line-clamp-2">
                {cat.description || `Browse ${cat.name} gear`}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-line bg-panel p-8 sm:p-12 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="default" className="mb-2">Simple 3-Step Process</Badge>
            <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">How RentNRoam Works</h2>
            <p className="mt-2 text-sm text-muted">
              Renting outdoor equipment has never been faster or safer.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {[
              {
                step: "01",
                title: "Browse & Select",
                desc: "Filter by category, brand, rating, and location. Choose your preferred rental start and end dates.",
                icon: Compass,
              },
              {
                step: "02",
                title: "Reserve & Confirm",
                desc: "Submit your order request. Providers confirm availability quickly, and you pay securely via Stripe.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Pickup & Adventure",
                desc: "Collect your gear at the local store or location, enjoy your trip, and return when finished.",
                icon: Clock,
              },
            ].map((item, idx) => (
              <div key={idx} className="relative flex flex-col items-start space-y-3 p-6 rounded-2xl bg-moss/5 dark:bg-snow/5 border border-line/40">
                <span className="font-display text-4xl text-blaze font-bold">{item.step}</span>
                <item.icon className="h-7 w-7 text-moss dark:text-fern" />
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: STATS BAND */}
      <section className="bg-moss text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="font-display text-4xl md:text-5xl text-blaze">15+</p>
            <p className="text-sm text-white/80 mt-1 font-medium">Quality Gear Items</p>
          </div>
          <div>
            <p className="font-display text-4xl md:text-5xl text-white">100%</p>
            <p className="text-sm text-white/80 mt-1 font-medium">Stripe Secure Payments</p>
          </div>
          <div>
            <p className="font-display text-4xl md:text-5xl text-blaze">3</p>
            <p className="text-sm text-white/80 mt-1 font-medium">Local Shop Partners</p>
          </div>
          <div>
            <p className="font-display text-4xl md:text-5xl text-emerald-400">4.9/5</p>
            <p className="text-sm text-white/80 mt-1 font-medium">Average Review Rating</p>
          </div>
        </div>
      </section>

      {/* SECTION 6: WHY RENT WITH US */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-2">Platform Benefits</Badge>
          <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">Why Choose RentNRoam</h2>
          <p className="mt-2 text-sm text-muted">
            The smartest way to access high-grade sports equipment without buying.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              title: "Verified Equipment",
              desc: "Every item is inspected by local providers to guarantee trail reliability.",
            },
            {
              icon: Zap,
              title: "Flexible Daily Rates",
              desc: "Pay only for the days you use with transparent pricing and no hidden fees.",
            },
            {
              icon: Award,
              title: "Stripe Protection",
              desc: "End-to-end encrypted Stripe Checkout protects your payments and bookings.",
            },
            {
              icon: Users,
              title: "Support Local Shops",
              desc: "Connect directly with trusted adventure gear providers in your area.",
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-line bg-panel space-y-3 shadow-xs hover:border-moss/40 transition"
            >
              <div className="h-10 w-10 rounded-xl bg-blaze/10 flex items-center justify-center text-blaze">
                <card.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-base text-ink">{card.title}</h3>
              <p className="text-xs text-muted leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS (Seeded Demo Users) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="default" className="mb-2">Community Feedback</Badge>
          <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">What Adventurers Say</h2>
          <p className="mt-2 text-sm text-muted">
            Real experiences from renters using RentNRoam equipment.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-line bg-panel space-y-4 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-ink/80 italic leading-relaxed">
                  &quot;{t.comment}&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-line/60 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-moss/15 flex items-center justify-center text-sm font-bold text-moss dark:text-fern">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm text-ink leading-none">{t.name}</p>
                  <p className="text-xs text-muted mt-0.5">{t.gear}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: FAQ ACCORDION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-2">Got Questions?</Badge>
          <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">Frequently Asked Questions</h2>
          <p className="mt-2 text-sm text-muted">
            Everything you need to know about renting and listing gear.
          </p>
        </div>

        <HomeFaq />
      </section>

      {/* SECTION 9: NEWSLETTER & PROVIDER CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Newsletter Box */}
          <div className="rounded-3xl border border-line bg-panel p-8 sm:p-10 space-y-4 flex flex-col justify-between shadow-xs">
            <div>
              <Badge variant="default" className="mb-2">Stay Updated</Badge>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-ink">Join the Trail Dispatch</h3>
              <p className="text-sm text-muted mt-2">
                Subscribe to get notified about new equipment listings, seasonal discounts, and outdoor guides.
              </p>
            </div>
            <HomeNewsletter />
          </div>

          {/* Become a Provider Box */}
          <div className="rounded-3xl bg-moss text-white p-8 sm:p-10 space-y-4 flex flex-col justify-between shadow-lg">
            <div>
              <span className="inline-block rounded-full bg-blaze px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
                Earn With RentNRoam
              </span>
              <h3 className="font-display text-2xl sm:text-3xl uppercase text-white">Have Outdoor Gear Sitting Idle?</h3>
              <p className="text-sm text-white/80 mt-2">
                Turn your bikes, tents, and water sports gear into extra income by listing on RentNRoam.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blaze px-6 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-blaze/90 shadow-md transition"
              >
                <span>Create Provider Account</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
