import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  const base = getBackendUrl();
  if (base) {
    await fetch(`${base}/api/auth/logout`, {
      method: "POST",
      headers: { cookie: req.headers.get("cookie") ?? "" },
    }).catch(() => {});
  }

  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
