import { NextRequest, NextResponse } from "next/server";
import { vi } from "vitest";

/** Build a NextRequest against a fixed origin (route handlers use nextUrl). */
export function makeRequest(
  path: string,
  init?: {
    method?: string;
    body?: unknown;
    searchParams?: Record<string, string>;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  }
): NextRequest {
  const url = new URL(path, "http://localhost:3000");
  if (init?.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      url.searchParams.set(k, v);
    }
  }

  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (init?.cookies) {
    const cookie = Object.entries(init.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
    headers.set("cookie", cookie);
  }

  return new NextRequest(url, {
    method: init?.method ?? "GET",
    headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

/** Multipart upload request for /api/upload tests. */
export function makeFormRequest(path: string, file: File): NextRequest {
  const fd = new FormData();
  fd.append("file", file);
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    method: "POST",
    body: fd,
  });
}

export function adminDenied(status: 401 | 403 | 503, error: string) {
  return NextResponse.json({ error }, { status });
}

export function allowAdmin(requireAdmin: ReturnType<typeof vi.fn>) {
  requireAdmin.mockResolvedValue(null);
}

export function denyAdmin(
  requireAdmin: ReturnType<typeof vi.fn>,
  status: 401 | 403 | 503,
  error: string
) {
  requireAdmin.mockResolvedValue(adminDenied(status, error));
}

export async function jsonBody<T = unknown>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}
