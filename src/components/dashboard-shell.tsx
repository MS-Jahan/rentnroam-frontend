"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn, dashboardPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  tab: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const ROLE_NAV: Record<string, NavItem[]> = {
  CUSTOMER: [
    { tab: "overview", label: "Overview", icon: LayoutDashboard },
    { tab: "rentals", label: "My Rentals", icon: Package },
    { tab: "payments", label: "Payment History", icon: CreditCard },
    { tab: "profile", label: "Profile & Password", icon: Settings },
  ],
  PROVIDER: [
    { tab: "overview", label: "Overview", icon: LayoutDashboard },
    { tab: "inventory", label: "Inventory", icon: Package },
    { tab: "orders", label: "Orders", icon: ShoppingCart },
    { tab: "analytics", label: "Analytics", icon: BarChart3 },
    { tab: "categories", label: "Categories", icon: Tag },
    { tab: "profile", label: "Profile Settings", icon: Settings },
  ],
  ADMIN: [
    { tab: "overview", label: "Overview", icon: LayoutDashboard },
    { tab: "users", label: "Manage Users", icon: Users },
    { tab: "gear", label: "Manage Gear", icon: Package },
    { tab: "rentals", label: "Manage Rentals", icon: ShoppingCart },
    { tab: "categories", label: "Categories", icon: Tag },
    { tab: "analytics", label: "Analytics", icon: BarChart3 },
    { tab: "profile", label: "Profile Settings", icon: Settings },
  ],
};

export function getNavConfig(role: string): NavItem[] {
  return ROLE_NAV[role] ?? ROLE_NAV.CUSTOMER;
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "overview";

  if (!user) return <>{children}</>;

  const nav = getNavConfig(user.role);
  const base = dashboardPath(user.role);
  const activeItem = nav.find((n) => n.tab === currentTab) ?? nav[0];

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clear();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Mobile nav strip */}
      <nav className="mb-6 flex items-center gap-2 overflow-x-auto pb-1 md:hidden">
        {nav.map((n) => {
          const isActive = n.tab === currentTab;
          const Icon = n.icon;
          return (
            <Link
              key={n.tab}
              href={`${base}?tab=${n.tab}`}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                isActive
                  ? "border-blaze/40 bg-blaze/10 text-blaze"
                  : "border-line bg-panel text-muted hover:text-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-start gap-6">
        {/* Sidebar */}
        <aside className="sticky top-20 hidden w-56 shrink-0 md:block">
          <div className="max-h-[calc(100vh-6rem)] overflow-y-auto">
            <div className="flex flex-col gap-1 rounded-2xl border border-line bg-panel p-2 shadow-xs">
              {nav.map((n) => {
                const isActive = n.tab === currentTab;
                const Icon = n.icon;
                return (
                  <Link
                    key={n.tab}
                    href={`${base}?tab=${n.tab}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-blaze/10 text-blaze border-l-2 border-blaze"
                        : "text-muted hover:bg-moss/10 hover:text-ink dark:hover:bg-snow/10"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blaze" : "text-muted")} />
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main column */}
        <main className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl uppercase tracking-wide text-ink">
                {activeItem.label}
              </h2>
              <Badge variant="secondary" className="uppercase text-[10px] tracking-wider py-0.5">
                {user.role}
              </Badge>
            </div>

            <div className="flex items-center gap-2.5">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full ring-blaze/30 hover:ring-2 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="right" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-semibold text-ink leading-none">{user.name}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(base)}>
                    <LayoutDashboard className="h-4 w-4 text-blaze" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`${base}?tab=profile`)}>
                    <Settings className="h-4 w-4 text-moss dark:text-fern" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}