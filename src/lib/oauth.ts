import { API_URL } from "@/lib/api";

export function startOAuth(
  provider: "google" | "facebook",
  options?: { next?: string; role?: "CUSTOMER" | "PROVIDER" }
) {
  const params = new URLSearchParams();
  if (options?.next) params.set("next", options.next);
  if (options?.role) params.set("role", options.role);
  const qs = params.toString();
  window.location.href = `${API_URL}/api/auth/${provider}${qs ? `?${qs}` : ""}`;
}
