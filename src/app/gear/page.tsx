"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, RefreshCw, SlidersHorizontal } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { Category, GearItem, Paginated } from "@/lib/types";
import { GearCard, GearCardSkeleton } from "@/components/gear-card";
import { Pagination } from "@/components/pagination";
import { Input, Select, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

function GearBrowseInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [available, setAvailable] = useState(
    searchParams.get("available") !== "false"
  );
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));

  // Sync state if URL changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setCategory(searchParams.get("category") || "");
    setBrand(searchParams.get("brand") || "");
    setLocation(searchParams.get("location") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setAvailable(searchParams.get("available") !== "false");
    setSort(searchParams.get("sort") || "newest");
    setPage(Number(searchParams.get("page") || 1));
  }, [searchParams]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (search.trim()) p.set("search", search.trim());
    if (category) p.set("category", category);
    if (brand.trim()) p.set("brand", brand.trim());
    if (location.trim()) p.set("location", location.trim());
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    if (available) p.set("available", "true");
    if (sort) p.set("sort", sort);
    p.set("page", String(page));
    p.set("limit", "9");
    return p.toString();
  }, [search, category, brand, location, minPrice, maxPrice, available, sort, page]);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () =>
      apiRequest<Category[]>("/api/categories"),
  });

  const gear = useQuery({
    queryKey: ["gear", queryString],
    queryFn: () =>
      apiRequest<Paginated<GearItem>>(`/api/gear?${queryString}`),
  });

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    const p = new URLSearchParams(queryString);
    p.set("page", "1");
    router.replace(`/gear?${p.toString()}`);
  }

  function resetFilters() {
    setSearch("");
    setCategory("");
    setBrand("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setAvailable(true);
    setSort("newest");
    setPage(1);
    router.replace("/gear");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Page Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <Badge variant="default">Equipment Catalog</Badge>
          <h1 className="font-display text-3xl sm:text-5xl uppercase text-ink mt-1">Browse Gear</h1>
          <p className="mt-1 text-sm text-muted">
            Find bikes, kayaks, tents, and climbing equipment available for daily rental.
          </p>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={applyFilters} className="relative max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-5 w-5 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gear by keyword, name, brand, or description..."
              className="w-full rounded-2xl border border-line bg-panel pl-12 pr-28 py-3.5 text-sm text-ink outline-none ring-blaze/30 focus:ring-2 shadow-xs transition"
            />
            <Button
              type="submit"
              className="absolute right-2 rounded-xl bg-blaze px-4 py-2 text-xs font-semibold text-white hover:bg-blaze/90"
            >
              Search
            </Button>
          </div>
        </form>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Filters Sidebar */}
        <form
          onSubmit={applyFilters}
          className="h-fit space-y-5 rounded-2xl border border-line bg-panel p-5 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 font-semibold text-ink text-sm">
              <SlidersHorizontal className="h-4 w-4 text-blaze" />
              <span>Filters</span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-muted hover:text-blaze flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div>
            <Label className="text-xs">Category</Label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 rounded-xl"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories.data)
                ? categories.data.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))
                : (categories.data as any)?.items?.map((c: Category) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
            </Select>
          </div>

          <div>
            <Label className="text-xs">Brand</Label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Marmot, Petzl, Giant"
              className="mt-1 rounded-xl text-xs"
            />
          </div>

          <div>
            <Label className="text-xs">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dhaka, Sylhet"
              className="mt-1 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Min $/day</Label>
              <Input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="mt-1 rounded-xl text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Max $/day</Label>
              <Input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="500"
                className="mt-1 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Sort By</Label>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1 rounded-xl text-xs"
            >
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="rounded accent-blaze h-4 w-4"
            />
            <span>Show available items only</span>
          </label>

          <Button type="submit" className="w-full rounded-xl py-2.5 text-xs font-semibold bg-blaze text-white hover:bg-blaze/90">
            Apply Filters
          </Button>
        </form>

        {/* Results View */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="text-sm font-medium text-muted">
              {gear.isLoading ? (
                "Searching gear catalog..."
              ) : (
                <>
                  Found <span className="font-semibold text-ink">{gear.data?.meta?.total || 0}</span> items
                </>
              )}
            </p>
          </div>

          {gear.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <GearCardSkeleton key={i} />
              ))}
            </div>
          ) : gear.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <p className="font-semibold">Failed to load gear listings</p>
              <p className="text-xs mt-1">{(gear.error as Error).message}</p>
            </div>
          ) : !gear.data?.items.length ? (
            <div className="rounded-2xl border border-dashed border-line bg-panel p-12 text-center space-y-3">
              <p className="text-base text-ink font-semibold">No gear matches your criteria</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Try clearing your search terms or relaxing price filters to see more results.
              </p>
              <Button type="button" variant="ghost" onClick={resetFilters} className="mt-2 text-xs">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {gear.data.items.map((g) => (
                  <GearCard key={g.id} gear={g} />
                ))}
              </div>
              <Pagination
                meta={gear.data.meta}
                page={page}
                onPageChange={(p) => {
                  setPage(p);
                  const newParams = new URLSearchParams(queryString);
                  newParams.set("page", String(p));
                  router.replace(`/gear?${newParams.toString()}`);
                }}
                className="mt-8"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GearPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading equipment catalog...</div>}>
      <GearBrowseInner />
    </Suspense>
  );
}
