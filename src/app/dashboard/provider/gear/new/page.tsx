"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient, apiRequest } from "@/lib/api";
import type { Category, GearItem, Paginated } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label, Select, Textarea } from "@/components/ui/field";

export default function NewGearPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [stock, setStock] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [error, setError] = useState("");

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => apiRequest<Paginated<Category>>("/api/categories?limit=50"),
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
          status,
          images: imageUrl ? [imageUrl] : [],
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
            {categories.data?.items.map((c) => (
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
          <Label>Image URL (optional)</Label>
          <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
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
