"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, apiRequest, fetchCategoryItems } from "@/lib/api";
import type { Category, GearItem, Paginated } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";

const MAX_SPECS = 8;
const MAX_IMAGES = 5;

export default function NewGearPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [stock, setStock] = useState("1");
  const [location, setLocation] = useState("");
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [images, setImages] = useState<string[]>([""]);
  const [status, setStatus] = useState("AVAILABLE");
  const [error, setError] = useState("");

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCategoryItems(),
  });

  const create = useMutation({
    mutationFn: () =>
      apiClient<GearItem>("/api/provider/gear", {
        auth: true,
        method: "POST",
        body: {
          name,
          brand,
          description,
          categoryId,
          pricePerDay: Number(pricePerDay),
          stock: Number(stock),
          location: location.trim() || null,
          specifications: buildSpecifications(specs),
          images: images.map((url) => url.trim()).filter((url) => url !== ""),
          status,
        },
      }),
    onSuccess: () => {
      toast.success("Gear added");
      router.push("/dashboard/provider");
    },
    onError: (e: Error) => {
      setError(e.message);
      toast.error(e.message);
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (description.length < 10) {
      setError("Description must be at least 10 characters");
      return;
    }
    create.mutate();
  }

  function updateSpec(index: number, field: "key" | "value", value: string) {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function removeSpec(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateImage(index: number, value: string) {
    setImages((prev) => prev.map((url, i) => (i === index ? value : url)));
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="font-display text-4xl uppercase text-ink">Add gear</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-moss/10 bg-snow p-6">
        <div>
          <Label>Name</Label>
          <Input required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Brand</Label>
          <Input required value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
        <div>
          <Label>Category</Label>
          <Select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Select…</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Price / day</Label>
            <Input required type="number" min={0.01} step="0.01" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} />
          </div>
          <div>
            <Label>Stock</Label>
            <Input required type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dhaka, Bangladesh" />
        </div>
        <div className="space-y-2">
          <Label>Specifications</Label>
          {specs.map((spec, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <Input value={spec.key} onChange={(e) => updateSpec(i, "key", e.target.value)} placeholder="Name (e.g. Weight)" />
              <Input value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)} placeholder="Value (e.g. 1.2 kg)" />
              <Button type="button" variant="ghost" className="px-3" onClick={() => removeSpec(i)}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
            disabled={specs.length >= MAX_SPECS}
          >
            Add specification
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Image URLs (optional)</Label>
          {images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                type="url"
                value={url}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder="https://…"
                className="flex-1"
              />
              <Button type="button" variant="ghost" className="px-3" onClick={() => removeImage(i)}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            onClick={() => setImages((prev) => [...prev, ""])}
            disabled={images.length >= MAX_IMAGES}
          >
            Add image
          </Button>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
          </Select>
        </div>
        <FieldError message={error} />
        <Button type="submit" loading={create.isPending} className="w-full">
          Save gear
        </Button>
      </form>
    </div>
  );
}

function buildSpecifications(specs: { key: string; value: string }[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const spec of specs) {
    const key = spec.key.trim();
    const value = spec.value.trim();
    if (key && value) result[key] = value;
  }
  return result;
}
