import { getSupabaseAccessToken } from "@/client/lib/supabase-browser";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function getApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export async function getApiHeaders({
  headers,
  withJsonContentType = false,
}: {
  headers?: HeadersInit;
  withJsonContentType?: boolean;
} = {}) {
  const resolvedHeaders = new Headers(headers);
  resolvedHeaders.set("Accept", "application/json");

  if (withJsonContentType && !resolvedHeaders.has("Content-Type")) {
    resolvedHeaders.set("Content-Type", "application/json");
  }

  const accessToken = await getSupabaseAccessToken();
  if (accessToken && !resolvedHeaders.has("Authorization")) {
    resolvedHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return resolvedHeaders;
}

export async function apiRequest<T>(input: RequestInfo | URL, init?: RequestInit) {
  const headers = await getApiHeaders({
    headers: init?.headers,
    withJsonContentType: Boolean(init?.body && !(init.body instanceof FormData)),
  });

  const response = await fetch(typeof input === "string" ? getApiUrl(input) : input, {
    ...init,
    credentials: "include",
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = payload?.error?.message ?? "Request failed.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function uploadWithFormData<T>(url: string, formData: FormData) {
  const headers = await getApiHeaders();
  const response = await fetch(getApiUrl(url), {
    method: "POST",
    body: formData,
    credentials: "include",
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(payload?.error?.message ?? "Upload failed.", response.status);
  }

  return payload as T;
}
