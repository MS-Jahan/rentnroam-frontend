import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  res.cookies.set("gearup_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("gearup_role", "", { path: "/", maxAge: 0 });
  return res;
}
