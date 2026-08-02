import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function GET() {
  const jar = await cookies();
  const token = jar.get("gearup_token")?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  const upstream = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await upstream.json();
  return NextResponse.json(json, { status: upstream.status });
}
