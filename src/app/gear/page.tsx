"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { Category, GearItem, Paginated } from "@/lib/types";
import { GearCard, GearCardSkeleton } from "@/components/gear-card";
import { Input, Select, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function GearBrowseInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [available, setAvailable] = useState(
    searchParams.get("available") !== "false"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (brand) p.set("brand", brand);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (available) p.set("available", "true");
    if (sort) p.set("sort", sort);
    p.set("page", String(page));
    p.set("limit", "9");
    return p.toString();
  }, [category, brand, minPrice, maxPrice, available, sort, page]);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      apiRequest<Paginated<Category>>("/api/categories?limit=50"),
  });

  const gear = useQuery({
    queryKey: ["gear", queryString],
    queryFn: () =>
      apiRequest<Paginated<GearItem>>(`/api/gear?${queryString}`),
  });

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    router.replace(`/gear?${queryString.replace(/page=\d+/, "page=1")}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl uppercase text-ink">Browse gear</h1>
      <p className="mt-1 text-ink/60">Filter by category, price, brand, and availability.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <form
          onSubmit={applyFilters}
          className="h-fit space-y-4 rounded-xl border border-moss/10 bg-snow p-4"
        >
          <div>
            <Label>Category</Label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.data?.items.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Brand</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. AquaFlow"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Min $/day</Label>
              <Input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div>
              <Label>Max $/day</Label>
              <Input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Sort</Label>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
            Available only
          </label>
          <Button type="submit" className="w-full">
            Apply filters
          </Button>
        </form>

        <div>
          {gear.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <GearCardSkeleton key={i} />
              ))}
            </div>
          ) : gear.isError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              {(gear.error as Error).message}
            </p>
          ) : !gear.data?.items.length ? (
            <p className="rounded-lg border border-dashed border-moss/20 bg-snow p-8 text-center text-ink/60">
              No gear matches these filters.
            </p>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {gear.data.items.map((g) => (
                  <GearCard key={g.id} gear={g} />
                ))}
              </div>
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-ink/60">
                  Page {gear.data.meta.page} of {gear.data.meta.totalPages}
                </span>
                <Button
                  variant="ghost"
                  disabled={page >= gear.data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GearPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading filters…</div>}>
      <GearBrowseInner />
    </Suspense>
  );
}
