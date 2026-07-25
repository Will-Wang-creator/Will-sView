import { NextRequest, NextResponse } from "next/server";

export function getBackendUrl(): string | null {
  const url = process.env.API_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

export function useRemoteBackend(): boolean {
  return Boolean(getBackendUrl());
}

export async function proxyToBackend(
  req: NextRequest,
  path: string
): Promise<NextResponse | null> {
  const base = getBackendUrl();
  if (!base) return null;

  const target = `${base}${path}${req.nextUrl.search}`;
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (key === "host" || key === "connection") return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(target, init);
  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
  });

  upstream.headers.forEach((value, key) => {
    if (key === "transfer-encoding" || key === "content-encoding") return;
    response.headers.set(key, value);
  });

  return response;
}
