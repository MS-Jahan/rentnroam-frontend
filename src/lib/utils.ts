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
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
    case "CONFIRMED":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200";
    case "PAID":
      return "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200";
    case "PICKED_UP":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
    case "RETURNED":
      return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
    case "AVAILABLE":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
    case "SUSPENDED":
      return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200";
    case "PENDING":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
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

export function formatApiErrorMessage(
  message?: string | null,
  details?: unknown,
  fallback = "Request failed"
) {
  if (Array.isArray(details) && details.length > 0) {
    const parts = details
      .map((d) => {
        if (!d || typeof d !== "object") return null;
        const item = d as { message?: string; path?: (string | number)[] };
        if (!item.message) return null;
        const field = item.path?.length ? `${item.path.join(".")}: ` : "";
        return `${field}${item.message}`;
      })
      .filter(Boolean);
    if (parts.length) return parts.join(" · ");
  }
  return message || fallback;
}
