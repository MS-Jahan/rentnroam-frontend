"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { cn, dashboardPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/gear", label: "Browse Gear" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help & FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clear();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-mist/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blaze text-white font-bold text-lg shadow-xs">
            R
          </span>
          Rent<span className="text-blaze">NRoam</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {publicLinks.map((l) => {
            const isActive = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium transition hover:text-blaze",
                  isActive ? "text-blaze font-semibold" : "text-ink/70"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="uppercase text-[10px] tracking-wider py-0.5">
                {user.role}
              </Badge>

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
                  <DropdownMenuItem onClick={() => router.push(dashboardPath(user.role))}>
                    <LayoutDashboard className="h-4 w-4 text-blaze" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`${dashboardPath(user.role)}?tab=profile`)}>
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
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-sm font-medium text-ink/80 hover:text-ink transition"
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-blaze px-4 py-2 text-sm font-semibold text-white hover:bg-blaze/90 shadow-xs transition"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 text-ink hover:text-blaze"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-panel px-4 py-4 md:hidden animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-3 text-ink">
            {publicLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-1 text-base font-medium hover:text-blaze"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {user ? (
              <>
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <p className="font-semibold text-ink">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
                <Link
                  href={dashboardPath(user.role)}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 py-1.5 font-medium text-blaze"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 text-left text-red-600 dark:text-red-400 py-1.5 font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="w-full text-center rounded-lg border border-line py-2 font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setOpen(false)}
                  className="w-full text-center rounded-lg bg-blaze py-2 font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
