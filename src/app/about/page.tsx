import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default" className="mx-auto">Our Mission</Badge>
        <h1 className="font-display text-4xl sm:text-6xl uppercase text-ink">
          Connecting Adventurers With Local Outdoor Gear
        </h1>
        <p className="text-base sm:text-lg text-muted leading-relaxed">
          RentNRoam was built on a simple premise: high-quality sports and outdoor equipment should be accessible to everyone without the burden of expensive ownership.
        </p>
      </div>

      {/* Story & Ecosystem Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="p-8 rounded-3xl border border-line bg-panel space-y-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-blaze/10 flex items-center justify-center text-blaze font-bold">
            01
          </div>
          <h3 className="font-semibold text-xl text-ink">For Renters</h3>
          <p className="text-xs text-muted leading-relaxed">
            Access top-tier mountain bikes, kayaks, camping tents, and climbing kits on-demand. Pay daily rates securely with Stripe Checkout and pick up gear locally.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-line bg-panel space-y-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-moss/10 flex items-center justify-center text-moss dark:text-fern font-bold">
            02
          </div>
          <h3 className="font-semibold text-xl text-ink">For Providers</h3>
          <p className="text-xs text-muted leading-relaxed">
            Turn idle sports equipment and shop inventory into steady monthly revenue. Manage bookings, set custom pricing, and connect with outdoor enthusiasts.
          </p>
        </div>

        <div className="p-8 rounded-3xl border border-line bg-panel space-y-3 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
            03
          </div>
          <h3 className="font-semibold text-xl text-ink">Trusted Ecosystem</h3>
          <p className="text-xs text-muted leading-relaxed">
            End-to-end verified listings, rating transparency, automated payment holds, and platform moderation ensure a smooth experience for all users.
          </p>
        </div>
      </div>

      {/* Values Banner */}
      <div className="rounded-3xl bg-moss text-white p-8 sm:p-12 grid gap-8 md:grid-cols-4 text-center">
        <div>
          <p className="font-display text-4xl text-blaze">100%</p>
          <p className="text-xs text-white/80 mt-1">Verified Equipment</p>
        </div>
        <div>
          <p className="font-display text-4xl text-white">Stripe</p>
          <p className="text-xs text-white/80 mt-1">Secure Checkout</p>
        </div>
        <div>
          <p className="font-display text-4xl text-blaze">Zero</p>
          <p className="text-xs text-white/80 mt-1">Maintenance Hassles</p>
        </div>
        <div>
          <p className="font-display text-4xl text-emerald-400">4.9★</p>
          <p className="text-xs text-white/80 mt-1">Community Rating</p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center max-w-xl mx-auto space-y-6 pt-4">
        <h2 className="font-display text-3xl uppercase text-ink">Ready for Your Next Trip?</h2>
        <p className="text-sm text-muted">
          Browse our equipment catalog or list your inventory on RentNRoam today.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/gear"
            className="rounded-xl bg-blaze px-6 py-3 text-sm font-semibold text-white hover:bg-blaze/90 shadow-xs"
          >
            Browse Catalog
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl border border-line bg-panel px-6 py-3 text-sm font-semibold text-ink hover:bg-moss/5"
          >
            Join as Provider
          </Link>
        </div>
      </div>
    </div>
  );
}
