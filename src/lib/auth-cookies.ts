import type { NextResponse } from "next/server";

export const TOKEN = "gearup_token";
export const ROLE = "gearup_role";

export function setAuthCookies(res: NextResponse, token: string, role: string) {
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
  res.cookies.set(TOKEN, token, opts);
  res.cookies.set(ROLE, role, { ...opts, httpOnly: false });
}
