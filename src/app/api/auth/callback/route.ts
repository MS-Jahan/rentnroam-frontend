import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/auth-cookies";
import { dashboardPath } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const role = searchParams.get("role");
  const next = searchParams.get("next");
  const error = searchParams.get("error");

  if (error || !token || !role) {
    return NextResponse.redirect(new URL("/auth/login?error=oauth", request.url));
  }

  const redirectPath = next || dashboardPath(role);
  const res = NextResponse.redirect(new URL(redirectPath, request.url));
  setAuthCookies(res, token, role);
  return res;
}
