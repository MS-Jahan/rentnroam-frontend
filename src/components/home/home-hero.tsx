"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Blaze } from "@/components/canvasui/Blaze";
import {
  PremiumGlowOrbs,
  PremiumSparkles,
  ShimmerText,
} from "@/components/home/premium-sparkles";

const categoryTeasers = [
  { name: "Camping & Outdoor", count: "5 items", icon: "⛺" },
  { name: "Cycling & Mountain Bikes", count: "3 items", icon: "🚴" },
  { name: "Water Sports & Kayaks", count: "4 items", icon: "🚣" },
  { name: "Climbing & Harnesses", count: "2 items", icon: "🧗" },
  { name: "Fitness & Training", count: "2 items", icon: "🏋️" },
];

export function HomeHero() {
  return (
    <Blaze
      className="relative min-h-[60vh] max-h-[70vh] w-full"
      height={0.42}
      sparks={0.58}
      sparkDensity={1.6}
      sparkSize={0.95}
      layers={5}
      smoke={0.22}
      glow={1.15}
      distortion={0.28}
      distortionScale={0.55}
      speed={0.85}
      sparkColor={[0.95, 0.36, 0.02]}
      smokeColor={[0.11, 0.26, 0.19]}
    >
      <section className="topo-bg relative flex min-h-[60vh] max-h-[70vh] items-center overflow-hidden py-16 text-white md:py-24">
        <PremiumGlowOrbs />
        <PremiumSparkles variant="hero" />
        <div className="relative z-[2] mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <div className="premium-glass-card inline-flex animate-rise items-center gap-2 rounded-full border border-blaze/40 bg-blaze/10 px-3.5 py-1 text-xs font-semibold text-blaze backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 animate-sparkle-pulse" />
              <span>Trail-Ready Sports Equipment Rental</span>
            </div>

            <h1 className="animate-rise-delay font-display text-4xl uppercase leading-none tracking-tight sm:text-6xl md:text-7xl">
              Rent Premium Gear. <br />
              <ShimmerText className="font-display uppercase">
                Own the Adventure.
              </ShimmerText>
            </h1>

            <p className="animate-rise-delay max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Bikes, kayaks, tents, and climbing kits from verified local shop
              owners. Pick dates, pay securely via Stripe, and hit the outdoors.
            </p>

            <div className="animate-rise-delay flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/gear"
                className="premium-cta-glow inline-flex items-center gap-2 rounded-xl bg-blaze px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-blaze/90"
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

            <div className="grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
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

          <div className="hidden lg:col-span-5 lg:block">
            <div className="premium-glass-card space-y-4 rounded-2xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-blaze">
                  Popular Categories
                </span>
                <span className="text-xs text-white/60">Live Inventory</span>
              </div>
              <div className="space-y-2.5">
                {categoryTeasers.map((item) => (
                  <Link
                    key={item.name}
                    href="/gear"
                    className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm font-semibold text-white transition group-hover:text-blaze">
                        {item.name}
                      </span>
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white/60">
                      {item.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Blaze>
  );
}
