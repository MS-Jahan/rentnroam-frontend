import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RentalStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(n) ? n : 0);
}

export function statusBadgeClass(status: RentalStatus | string) {
  switch (status) {
    case "PLACED":
      return "bg-amber-100 text-amber-800";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-800";
    case "PAID":
      return "bg-violet-100 text-violet-800";
    case "PICKED_UP":
      return "bg-emerald-100 text-emerald-800";
    case "RETURNED":
      return "bg-slate-200 text-slate-700";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    case "AVAILABLE":
      return "bg-emerald-100 text-emerald-800";
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800";
    case "SUSPENDED":
      return "bg-red-100 text-red-800";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800";
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function toIsoDateStart(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

export function dashboardPath(role: string) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "PROVIDER") return "/dashboard/provider";
  return "/dashboard/customer";
}
