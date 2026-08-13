import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export function GET() {
  return NextResponse.redirect(`${API_URL}/api/docs`, 307);
}
