"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { cn, dashboardPath } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const publicLinks = [
  { href: "/gear", label: "Browse Gear" },
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
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-mist/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide text-ink">
          Gear<span className="text-blaze">Up</span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex">
          {publicLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium text-ink/70 transition hover:text-ink",
                pathname.startsWith(l.href) && "text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href={dashboardPath(user.role)}
                className="text-sm font-medium text-ink/70 hover:text-ink"
              >
                Dashboard
              </Link>
              <ThemeToggle />
              <button
                type="button"
                onClick={logout}
                className="rounded-md bg-moss px-3 py-1.5 text-sm font-semibold text-white hover:bg-fern"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-ink/70 hover:text-ink">
                Sign in
              </Link>
              <ThemeToggle />
              <Link
                href="/auth/register"
                className="rounded-md bg-blaze px-3 py-1.5 text-sm font-semibold text-white hover:bg-blaze/90"
              >
                Get started
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="text-ink"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-mist px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-ink">
            {publicLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={dashboardPath(user.role)} onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="text-left text-blaze">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link href="/auth/register" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
