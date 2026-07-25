import { NextRequest, NextResponse } from "next/server";
import { pricingPlans } from "@/lib/data/pricing";
import { getSession, activateSubscription } from "@/lib/auth";
import { proxyToBackend } from "@/lib/api-proxy";
function subscriptionEndDate(planId: string): string {
  const end = new Date();
  if (planId === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const proxied = await proxyToBackend(req, "/api/checkout");
  if (proxied) return proxied;

  try {    const { planId } = await req.json();
    const plan = pricingPlans.find((p) => p.id === planId);

    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Sign in to subscribe" }, { status: 401 });
    }

    await activateSubscription(user.email, subscriptionEndDate(planId), planId);
    const origin = req.headers.get("origin") || "http://localhost:3000";
    return NextResponse.json({
      url: `${origin}/subscribe/success`,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to activate subscription" },
      { status: 500 }
    );
  }
}
