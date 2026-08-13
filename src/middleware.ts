import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "gearup_token";
const ROLE_COOKIE = "gearup_role";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!token || !role) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    if (pathname.startsWith("/dashboard/provider") && role !== "PROVIDER") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
    if (pathname.startsWith("/dashboard/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL(homeFor(role), request.url));
    }
  }

  if (
    (pathname.startsWith("/auth/login") ||
      pathname.startsWith("/auth/register")) &&
    token &&
    role
  ) {
    return NextResponse.redirect(new URL(homeFor(role), request.url));
  }

  return NextResponse.next();
}

function homeFor(role: string) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "PROVIDER") return "/dashboard/provider";
  return "/dashboard/customer";
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/auth/login", "/auth/register"],
};
