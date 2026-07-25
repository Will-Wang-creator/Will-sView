import { NextRequest, NextResponse } from "next/server";
import { handleNewebPayCallback } from "@/lib/newebpay-checkout";

function appOrigin(req: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    req.headers.get("origin") ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const tradeInfo = form.get("TradeInfo")?.toString();
    const tradeSha = form.get("TradeSha")?.toString();
    const baseUrl = appOrigin(req);

    if (!tradeInfo || !tradeSha) {
      return NextResponse.redirect(`${baseUrl}/pricing?payment=failed`, 303);
    }

    const result = await handleNewebPayCallback({ tradeInfo, tradeSha });

    if (!result.ok) {
      console.error("NewebPay return failed:", result.error);
      return NextResponse.redirect(`${baseUrl}/pricing?payment=failed`, 303);
    }

    return NextResponse.redirect(`${baseUrl}/subscribe/success`, 303);
  } catch (error) {
    console.error("NewebPay return error:", error);
    return NextResponse.redirect(`${appOrigin(req)}/pricing?payment=failed`, 303);
  }
}

export async function GET() {
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pricing`,
    303
  );
}
