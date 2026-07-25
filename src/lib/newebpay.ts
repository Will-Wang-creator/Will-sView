import crypto from "crypto";

const TEST_GATEWAY = "https://ccore.newebpay.com/MPG/mpg_gateway";
const PROD_GATEWAY = "https://core.newebpay.com/MPG/mpg_gateway";

export interface NewebPayConfig {
  merchantId: string;
  hashKey: string;
  hashIv: string;
  testMode: boolean;
}

export interface NewebPayCheckoutInput {
  merchantOrderNo: string;
  amountTwd: number;
  itemDesc: string;
  email: string;
  returnUrl: string;
  notifyUrl: string;
  clientBackUrl: string;
}

export interface NewebPayForm {
  action: string;
  method: "POST";
  fields: {
    MerchantID: string;
    TradeInfo: string;
    TradeSha: string;
    Version: string;
  };
}

export interface NewebPayTradeResult {
  Status: string;
  Message?: string;
  Result?: {
    MerchantOrderNo?: string;
    Amt?: number;
    TradeNo?: string;
    PaymentType?: string;
    PayTime?: string;
  };
}

export function getNewebPayConfig(): NewebPayConfig | null {
  const merchantId = process.env.NEWEBPAY_MERCHANT_ID?.trim();
  const hashKey = process.env.API_HASHKEY?.trim();
  const hashIv = process.env.API_HASHIV?.trim();
  if (!merchantId || !hashKey || !hashIv) return null;

  const testMode = process.env.NEWEBPAY_TEST_MODE !== "false";
  return { merchantId, hashKey, hashIv, testMode };
}

export function isNewebPayConfigured(): boolean {
  return Boolean(getNewebPayConfig());
}

export function getNewebPayGateway(config: NewebPayConfig): string {
  return config.testMode ? TEST_GATEWAY : PROD_GATEWAY;
}

function encryptTradePayload(payload: Record<string, string | number>, config: NewebPayConfig): string {
  const query = new URLSearchParams(
    Object.entries(payload).map(([key, value]) => [key, String(value)])
  ).toString();

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(config.hashKey, "utf8"),
    Buffer.from(config.hashIv, "utf8")
  );
  let encrypted = cipher.update(query, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

function hashTradeInfo(tradeInfo: string, hashKey: string): string {
  const plain = `HashKey=${hashKey}&${tradeInfo}&HashKey=${hashKey}`;
  return crypto.createHash("sha256").update(plain).digest("hex").toUpperCase();
}

export function createNewebPayForm(
  config: NewebPayConfig,
  input: NewebPayCheckoutInput
): NewebPayForm {
  const payload = {
    MerchantID: config.merchantId,
    RespondType: "JSON",
    TimeStamp: Math.floor(Date.now() / 1000),
    Version: "2.0",
    MerchantOrderNo: input.merchantOrderNo,
    Amt: input.amountTwd,
    ItemDesc: input.itemDesc.slice(0, 50),
    Email: input.email,
    LoginType: 0,
    ReturnURL: input.returnUrl,
    NotifyURL: input.notifyUrl,
    ClientBackURL: input.clientBackUrl,
    LANG: "zh-tw",
  };

  const tradeInfo = encryptTradePayload(payload, config);
  const tradeSha = hashTradeInfo(tradeInfo, config.hashKey);

  return {
    action: getNewebPayGateway(config),
    method: "POST",
    fields: {
      MerchantID: config.merchantId,
      TradeInfo: tradeInfo,
      TradeSha: tradeSha,
      Version: "2.0",
    },
  };
}

export function decryptTradeInfo(tradeInfo: string, config: NewebPayConfig): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(config.hashKey, "utf8"),
    Buffer.from(config.hashIv, "utf8")
  );
  let decrypted = decipher.update(tradeInfo, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function verifyTradeSha(
  tradeInfo: string,
  tradeSha: string,
  config: NewebPayConfig
): boolean {
  const expected = hashTradeInfo(tradeInfo, config.hashKey);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(tradeSha.toUpperCase(), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function parseTradeResult(decrypted: string): NewebPayTradeResult {
  try {
    return JSON.parse(decrypted) as NewebPayTradeResult;
  } catch {
    const params = new URLSearchParams(decrypted);
    const result: NewebPayTradeResult = {
      Status: params.get("Status") ?? "",
      Message: params.get("Message") ?? undefined,
    };
    if (params.get("MerchantOrderNo")) {
      result.Result = {
        MerchantOrderNo: params.get("MerchantOrderNo") ?? undefined,
        Amt: params.get("Amt") ? Number(params.get("Amt")) : undefined,
        TradeNo: params.get("TradeNo") ?? undefined,
      };
    }
    return result;
  }
}

export function generateMerchantOrderNo(): string {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `WV${Date.now()}${suffix}`.slice(0, 20);
}

export function isPaymentSuccessful(result: NewebPayTradeResult): boolean {
  return result.Status === "SUCCESS";
}
