import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";
import { setAuthCookies } from "@/lib/auth-cookies";
import type { ApiResponse, AuthPayload } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await upstream.json()) as ApiResponse<AuthPayload>;
    if (!upstream.ok || !json.success) {
      return NextResponse.json(json, { status: upstream.status });
    }
    const res = NextResponse.json(json);
    setAuthCookies(res, json.data.token, json.data.user.role);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}
