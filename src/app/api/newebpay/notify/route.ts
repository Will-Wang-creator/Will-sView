import { NextRequest, NextResponse } from "next/server";
import { handleNewebPayCallback } from "@/lib/newebpay-checkout";

async function readCallbackBody(req: NextRequest): Promise<{
  tradeInfo: string | null;
  tradeSha: string | null;
}> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await req.json();
    return {
      tradeInfo: body.TradeInfo ?? body.tradeInfo ?? null,
      tradeSha: body.TradeSha ?? body.tradeSha ?? null,
    };
  }

  const form = await req.formData();
  return {
    tradeInfo: form.get("TradeInfo")?.toString() ?? null,
    tradeSha: form.get("TradeSha")?.toString() ?? null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { tradeInfo, tradeSha } = await readCallbackBody(req);

    if (!tradeInfo || !tradeSha) {
      return new NextResponse("Missing TradeInfo", { status: 400 });
    }

    const result = await handleNewebPayCallback({ tradeInfo, tradeSha });

    if (!result.ok) {
      console.error("NewebPay notify failed:", result.error);
      return new NextResponse("FAIL", { status: 400 });
    }

    return new NextResponse("1|OK", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("NewebPay notify error:", error);
    return new NextResponse("FAIL", { status: 500 });
  }
}
