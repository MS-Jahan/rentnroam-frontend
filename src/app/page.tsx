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
} from "lucide-react";
import { apiRequest, fetchCategoryItems } from "@/lib/api";
import type { GearItem, Category, Paginated } from "@/lib/types";
import { GearCard } from "@/components/gear-card";
import { HomeFaq } from "@/components/home-faq";
import { HomeNewsletter } from "@/components/home-newsletter";
import { HomeHero } from "@/components/home/home-hero";
import { PremiumSectionHeader } from "@/components/home/premium-section-header";
import { PremiumSparkles } from "@/components/home/premium-sparkles";
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
    categories = await fetchCategoryItems();
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
      <HomeHero />

      {/* SECTION 2: FEATURED GEAR */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <PremiumSectionHeader
            eyebrow="Verified Inventory"
            title="Featured Gear"
            description="Ready for immediate pickup and rental today."
            centered={false}
            showDivider={false}
            className="mb-0 text-left max-w-none"
          />
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
        <PremiumSectionHeader
          eyebrow="Explore By Sport"
          title="Gear Categories"
          description="Find specialized equipment designed for every outdoor activity."
          badgeVariant="secondary"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/gear?category=${cat.slug}`}
              className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-line bg-panel transition-all duration-200 hover:-translate-y-1 hover:border-blaze/40 hover:shadow-md overflow-hidden"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-3 h-px bg-gradient-to-r from-transparent via-blaze/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />
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
        <div className="rounded-3xl border border-line bg-panel p-8 sm:p-12 shadow-xs relative overflow-hidden">
          <PremiumSparkles variant="section" className="opacity-60" />
          <PremiumSectionHeader
            eyebrow="Simple 3-Step Process"
            title="How RentNRoam Works"
            description="Renting outdoor equipment has never been faster or safer."
          />

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
      <section className="relative overflow-hidden bg-moss text-white py-14">
        <PremiumSparkles variant="band" />
        <div className="relative z-[1] mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
        <PremiumSectionHeader
          eyebrow="Platform Benefits"
          title="Why Choose RentNRoam"
          description="The smartest way to access high-grade sports equipment without buying."
          badgeVariant="secondary"
        />

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
        <PremiumSectionHeader
          eyebrow="Community Feedback"
          title="What Adventurers Say"
          description="Real experiences from renters using RentNRoam equipment."
        />

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
        <PremiumSectionHeader
          eyebrow="Got Questions?"
          title="Frequently Asked Questions"
          description="Everything you need to know about renting and listing gear."
          badgeVariant="secondary"
        />

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
