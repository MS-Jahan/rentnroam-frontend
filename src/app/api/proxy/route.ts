import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { path, method = "GET", body } = await request.json();
    if (typeof path !== "string" || !path.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "Invalid path" },
        { status: 400 }
      );
    }

    const jar = await cookies();
    const token = jar.get("gearup_token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const upstream = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body:
        body !== undefined && method !== "GET" && method !== "HEAD"
          ? JSON.stringify(body)
          : undefined,
      cache: "no-store",
    });

    const json = await upstream.json();
    return NextResponse.json(json, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Proxy request failed" },
      { status: 500 }
    );
  }
}
