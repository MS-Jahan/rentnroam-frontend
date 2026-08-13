import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { apiRequest, fetchCategoryItems } from "@/lib/api";
import type { GearItem, Category, Paginated } from "@/lib/types";
import { HomeHero } from "@/components/home/home-hero";
import { HomeSections } from "@/components/home/home-sections";
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
    categories = await fetchCategoryItems();
  } catch {
    categories = [];
  }

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
      <HomeHero />

      <HomeSections
        featured={featured}
        categories={categories}
        testimonials={testimonials}
      />

      {/* NEWSLETTER & PROVIDER CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-between space-y-4 rounded-3xl border border-line bg-panel p-8 shadow-xs sm:p-10">
            <div>
              <Badge variant="default" className="mb-2">
                Stay Updated
              </Badge>
              <h3 className="font-display text-2xl uppercase text-ink sm:text-3xl">
                Join the Trail Dispatch
              </h3>
              <p className="mt-2 text-sm text-muted">
                Subscribe to get notified about new equipment listings, seasonal
                discounts, and outdoor guides.
              </p>
            </div>
            <HomeNewsletter />
          </div>

          <div className="flex flex-col justify-between space-y-4 rounded-3xl bg-moss p-8 text-white shadow-lg sm:p-10">
            <div>
              <span className="mb-2 inline-block rounded-full bg-blaze px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Earn With RentNRoam
              </span>
              <h3 className="font-display text-2xl uppercase text-white sm:text-3xl">
                Have Outdoor Gear Sitting Idle?
              </h3>
              <p className="mt-2 text-sm text-white/80">
                Turn your bikes, tents, and water sports gear into extra income
                by listing on RentNRoam.
              </p>
            </div>
            <div className="pt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blaze px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-blaze/90"
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
