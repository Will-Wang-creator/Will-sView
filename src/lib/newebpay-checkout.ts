import {
  createNewebPayForm,
  generateMerchantOrderNo,
  getNewebPayConfig,
  isPaymentSuccessful,
  isNewebPayConfigured,
  parseTradeResult,
  verifyTradeSha,
  decryptTradeInfo,
} from "@/lib/newebpay";
import { pricingPlans } from "@/lib/data/pricing";
import {
  activateSubscription,
  createPendingPayment,
  findPendingPayment,
  markPendingPaymentPaid,
} from "@/lib/db";
import { SITE_NAME } from "@/lib/site";

function subscriptionEndDate(planId: string): string {
  const end = new Date();
  if (planId === "monthly") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end.toISOString().split("T")[0];
}

function appOrigin(fallbackOrigin?: string | null): string {
  return (
    fallbackOrigin?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function createNewebPayCheckout(params: {
  planId: string;
  userEmail: string;
  origin?: string | null;
}) {
  const config = getNewebPayConfig();
  if (!config) {
    throw new Error("NewebPay is not configured");
  }

  const plan = pricingPlans.find((p) => p.id === params.planId);
  if (!plan) {
    throw new Error("Invalid plan");
  }

  const merchantOrderNo = generateMerchantOrderNo();
  const baseUrl = appOrigin(params.origin);

  await createPendingPayment(
    merchantOrderNo,
    params.userEmail,
    plan.id,
    plan.priceTwd
  );

  const form = createNewebPayForm(config, {
    merchantOrderNo,
    amountTwd: plan.priceTwd,
    itemDesc: `${SITE_NAME} ${plan.name} membership`,
    email: params.userEmail,
    returnUrl: `${baseUrl}/api/newebpay/return`,
    notifyUrl: `${baseUrl}/api/newebpay/notify`,
    clientBackUrl: `${baseUrl}/pricing`,
  });

  return { newebpay: form };
}

export async function fulfillNewebPayPayment(
  merchantOrderNo: string,
  paidAmount?: number
): Promise<{ ok: boolean; error?: string }> {
  const pending = await findPendingPayment(merchantOrderNo);
  if (!pending) {
    return { ok: false, error: "Order not found" };
  }

  if (pending.status === "paid") {
    return { ok: true };
  }

  if (paidAmount != null && paidAmount !== pending.amountTwd) {
    return { ok: false, error: "Amount mismatch" };
  }

  const marked = await markPendingPaymentPaid(merchantOrderNo);
  if (!marked) {
    return { ok: false, error: "Unable to mark order paid" };
  }

  await activateSubscription(
    pending.userEmail,
    subscriptionEndDate(pending.planId),
    pending.planId
  );

  return { ok: true };
}

export async function handleNewebPayCallback(params: {
  tradeInfo: string;
  tradeSha: string;
}): Promise<{ ok: boolean; merchantOrderNo?: string; error?: string }> {
  const config = getNewebPayConfig();
  if (!config) {
    return { ok: false, error: "NewebPay is not configured" };
  }

  if (!verifyTradeSha(params.tradeInfo, params.tradeSha, config)) {
    return { ok: false, error: "Invalid signature" };
  }

  const decrypted = decryptTradeInfo(params.tradeInfo, config);
  const parsed = parseTradeResult(decrypted);

  if (!isPaymentSuccessful(parsed)) {
    return {
      ok: false,
      error: parsed.Message || "Payment not successful",
    };
  }

  const merchantOrderNo = parsed.Result?.MerchantOrderNo;
  if (!merchantOrderNo) {
    return { ok: false, error: "Missing order number" };
  }

  const result = await fulfillNewebPayPayment(
    merchantOrderNo,
    parsed.Result?.Amt
  );

  return {
    ok: result.ok,
    merchantOrderNo,
    error: result.error,
  };
}

export { isNewebPayConfigured, subscriptionEndDate };
