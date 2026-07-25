import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/auth";
import { proxyToBackend } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  const proxied = await proxyToBackend(req, "/api/auth/register");
  if (proxied) return proxied;

  try {    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const result = await register(email, password, name, {
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const response = NextResponse.json({ user: result.user });
    response.cookies.set("session", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
