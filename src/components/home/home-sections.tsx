"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  ChevronDown,
  Clock,
  Compass,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import type { Category, GearItem } from "@/lib/types";
import { GearCard } from "@/components/gear-card";
import { AnimatedSection } from "@/components/home/animated-section";
import { HomeFaq } from "@/components/home-faq";
import { PremiumSparkles } from "@/components/home/premium-sparkles";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, string> = {
  camping: "⛺",
  cycling: "🚴",
  "water-sports": "🚣",
  climbing: "🧗",
  fitness: "🏋️",
};

const categoryAccents: Record<string, string> = {
  camping: "from-emerald-500/20 to-moss/5",
  cycling: "from-sky-500/20 to-moss/5",
  "water-sports": "from-cyan-500/20 to-moss/5",
  climbing: "from-amber-500/20 to-moss/5",
  fitness: "from-orange-500/20 to-blaze/10",
};

const steps = [
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
];

const benefits = [
  {
    icon: Shield,
    title: "Verified Equipment",
    desc: "Every item is inspected by local providers to guarantee trail reliability.",
    detail: "Providers maintain gear logs and availability windows so you know what is trail-ready before pickup.",
  },
  {
    icon: Zap,
    title: "Flexible Daily Rates",
    desc: "Pay only for the days you use with transparent pricing and no hidden fees.",
    detail: "Daily pricing scales with rental length — ideal for weekend trips or longer expeditions.",
  },
  {
    icon: Award,
    title: "Stripe Protection",
    desc: "End-to-end encrypted Stripe Checkout protects your payments and bookings.",
    detail: "Payments are processed securely and tied to confirmed rental orders in your dashboard.",
  },
  {
    icon: Users,
    title: "Support Local Shops",
    desc: "Connect directly with trusted adventure gear providers in your area.",
    detail: "Rent from verified Bangladesh outdoor shops in Dhaka, Chattogram, Cox's Bazar, and Sylhet.",
  },
];

function ExpandPanel({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
      )}
    >
      <div className="overflow-hidden">
        <div className="pt-3">{children}</div>
      </div>
    </div>
  );
}

interface HomeSectionsProps {
  featured: GearItem[];
  categories: Category[];
  testimonials: {
    name: string;
    role: string;
    comment: string;
    rating: number;
    gear: string;
    avatar: string;
  }[];
}

export function HomeSections({
  featured,
  categories,
  testimonials,
}: HomeSectionsProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(
    categories[0]?.id ?? null
  );
  const [openStep, setOpenStep] = useState<number | null>(0);
  const [openBenefit, setOpenBenefit] = useState<number | null>(0);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* FEATURED GEAR */}
      <AnimatedSection
        eyebrow="Verified Inventory"
        title="Featured Gear"
        description="Ready for immediate pickup and rental today."
        centered={false}
        showDivider={false}
        headerClassName="mb-0"
        className="relative"
        contentClassName="mt-2"
      >
        <div className="mb-8 flex justify-end">
          <Link
            href="/gear"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blaze hover:underline"
          >
            <span>Explore full catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="space-y-3 rounded-2xl border border-line bg-panel p-12 text-center">
            <p className="text-base text-muted">
              No featured gear items available right now.
            </p>
            <Link
              href="/gear"
              className="inline-block text-sm font-semibold text-blaze"
            >
              Browse all listings
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((g) => (
              <GearCard key={g.id} gear={g} />
            ))}
          </div>
        )}
      </AnimatedSection>

      {/* CATEGORIES — expandable explorer */}
      <AnimatedSection
        eyebrow="Explore By Sport"
        title="Gear Categories"
        description="Tap a sport to expand trail-ready inventory paths."
        badgeVariant="secondary"
      >
        <div className="mx-auto grid max-w-4xl gap-3">
          {categories.map((cat) => {
            const open = openCategory === cat.id;
            const accent =
              categoryAccents[cat.slug] ?? "from-blaze/15 to-panel";
            return (
              <div
                key={cat.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-500",
                  open
                    ? "border-blaze/40 bg-gradient-to-br shadow-md " + accent
                    : "border-line bg-panel hover:border-blaze/25"
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenCategory(open ? null : cat.id)
                  }
                  className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
                  aria-expanded={open}
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-line/60 bg-panel/80 text-2xl">
                    {categoryIcons[cat.slug] || "⚽"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{cat.name}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {cat.description || `Browse ${cat.name} gear`}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted transition-transform duration-500",
                      open && "rotate-180 text-blaze"
                    )}
                  />
                </button>
                <ExpandPanel open={open}>
                  <div className="border-t border-line/50 px-4 pb-5 sm:px-5">
                    <p className="text-sm leading-relaxed text-muted">
                      {cat.description ||
                        `Discover ${cat.name.toLowerCase()} rentals from verified local providers.`}
                    </p>
                    {cat._count?.gearItems !== undefined ? (
                      <p className="mt-2 text-xs font-medium text-blaze">
                        {cat._count.gearItems} listings available
                      </p>
                    ) : null}
                    <Link
                      href={`/gear?category=${cat.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blaze px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-blaze/90"
                    >
                      Browse {cat.name}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </ExpandPanel>
              </div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-panel p-8 shadow-xs sm:p-12">
          <PremiumSparkles variant="section" className="opacity-50" />
          <AnimatedSection
            as="div"
            contained={false}
            eyebrow="Simple 3-Step Process"
            title="How RentNRoam Works"
            description="Renting outdoor equipment has never been faster or safer."
            className="relative z-[1] w-full"
            contentClassName="mt-0"
          >
            <div className="mx-auto max-w-2xl space-y-3">
              {steps.map((item, idx) => {
                const open = openStep === idx;
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className={cn(
                      "rounded-2xl border transition-all duration-500",
                      open
                        ? "border-blaze/35 bg-moss/5 dark:bg-snow/5"
                        : "border-line/50 bg-panel/50"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenStep(open ? null : idx)}
                      className="flex w-full items-center gap-4 p-5 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-display text-3xl font-bold text-blaze">
                        {item.step}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 font-semibold text-ink">
                          <Icon className="h-4 w-4 text-moss dark:text-fern" />
                          {item.title}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 shrink-0 text-muted transition-transform duration-500",
                          open && "rotate-180 text-blaze"
                        )}
                      />
                    </button>
                    <ExpandPanel open={open}>
                      <div className="border-t border-line/40 px-5 pb-5">
                        <p className="text-sm leading-relaxed text-muted">
                          {item.desc}
                        </p>
                      </div>
                    </ExpandPanel>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* STATS */}
      <section className="relative overflow-hidden bg-moss py-14 text-white">
        <PremiumSparkles variant="band" />
        <div className="relative z-[1] mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 md:grid-cols-4">
          {[
            { value: "15+", label: "Quality Gear Items", accent: "text-blaze" },
            { value: "100%", label: "Stripe Secure Payments", accent: "text-white" },
            { value: "3", label: "Local Shop Partners", accent: "text-blaze" },
            { value: "4.9/5", label: "Average Review Rating", accent: "text-emerald-400" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <p className={cn("font-display text-4xl md:text-5xl", stat.accent)}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <AnimatedSection
        eyebrow="Platform Benefits"
        title="Why Choose RentNRoam"
        description="The smartest way to access high-grade sports equipment without buying."
        badgeVariant="secondary"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((card, idx) => {
            const open = openBenefit === idx;
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className={cn(
                  "rounded-2xl border transition-all duration-500",
                  open
                    ? "border-blaze/30 bg-panel shadow-md"
                    : "border-line bg-panel/80 hover:border-moss/30"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenBenefit(open ? null : idx)}
                  className="flex w-full items-start gap-3 p-5 text-left"
                  aria-expanded={open}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blaze/10 text-blaze">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{card.title}</span>
                    <span className="mt-1 block text-xs text-muted">{card.desc}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted transition-transform duration-500",
                      open && "rotate-180 text-blaze"
                    )}
                  />
                </button>
                <ExpandPanel open={open}>
                  <div className="border-t border-line/50 px-5 pb-5">
                    <p className="text-sm leading-relaxed text-muted">{card.detail}</p>
                  </div>
                </ExpandPanel>
              </div>
            );
          })}
        </div>
      </AnimatedSection>

      {/* TESTIMONIALS */}
      <AnimatedSection
        eyebrow="Community Feedback"
        title="What Adventurers Say"
        description="Real experiences from renters using RentNRoam equipment."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between space-y-4 rounded-2xl border border-line bg-panel p-6 shadow-xs transition hover:border-blaze/25"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm italic leading-relaxed text-ink/80">
                  &quot;{t.comment}&quot;
                </p>
              </div>
              <div className="flex items-center gap-3 border-t border-line/60 pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-moss/15 text-sm font-bold text-moss dark:text-fern">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none text-ink">{t.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{t.gear}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection
        eyebrow="Got Questions?"
        title="Frequently Asked Questions"
        description="Everything you need to know about renting and listing gear."
        badgeVariant="secondary"
      >
        <HomeFaq />
      </AnimatedSection>
    </div>
  );
}
