import type { ApiResponse } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://gearup-api.vercel.app";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: HeadersInit;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, token, headers } = options;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("Unexpected server response", res.status);
  }

  if (!res.ok || !json.success) {
    throw new ApiError(
      json.message || "Request failed",
      res.status,
      json.errorDetails
    );
  }

  return json.data;
}

export async function apiClient<T>(
  path: string,
  options: Omit<RequestOptions, "token"> & { auth?: boolean } = {}
): Promise<T> {
  const { auth = false, method = "GET", body } = options;

  if (!auth) {
    return apiRequest<T>(path, { method, body });
  }

  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, method, body }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new ApiError(
      json.message || "Request failed",
      res.status,
      json.errorDetails
    );
  }
  return json.data as T;
}
