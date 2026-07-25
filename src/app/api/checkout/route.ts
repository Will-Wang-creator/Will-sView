import { NextRequest, NextResponse } from "next/server";
import { pricingPlans } from "@/lib/data/pricing";
import { getSession, activateSubscription } from "@/lib/auth";
import { proxyToBackend } from "@/lib/api-proxy";
import {
  createNewebPayCheckout,
  isNewebPayConfigured,
  subscriptionEndDate,
} from "@/lib/newebpay-checkout";

export async function POST(req: NextRequest) {
  if (!isNewebPayConfigured()) {
    const proxied = await proxyToBackend(req, "/api/checkout");
    if (proxied) return proxied;
  }

  try {
    const { planId } = await req.json();
    const plan = pricingPlans.find((p) => p.id === planId);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Sign in to subscribe" }, { status: 401 });
    }

    if (isNewebPayConfigured()) {
      const checkout = await createNewebPayCheckout({
        planId,
        userEmail: user.email,
        origin: req.headers.get("origin"),
      });
      return NextResponse.json(checkout);
    }

    await activateSubscription(user.email, subscriptionEndDate(planId), planId);
    const origin = req.headers.get("origin") || "http://localhost:3000";
    return NextResponse.json({
      url: `${origin}/subscribe/success`,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to start checkout" },
      { status: 500 }
    );
  }
}
