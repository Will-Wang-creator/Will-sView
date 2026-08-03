/**
 * Verify admin member credentials against Turso (local use only).
 * Usage: node scripts/verify-admin-member.mjs --email ... --password ...
 */
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const emailArg = process.argv.indexOf("--email");
const passArg = process.argv.indexOf("--password");
const email = (emailArg >= 0 ? process.argv[emailArg + 1] : "").trim().toLowerCase();
const password = passArg >= 0 ? process.argv[passArg + 1] : "";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute({
  sql: "SELECT password_hash, is_subscribed, subscription_end, plan_id FROM users WHERE email = ?",
  args: [email],
});

if (result.rows.length === 0) {
  console.log(JSON.stringify({ ok: false, reason: "user not found" }));
  process.exit(1);
}

const row = result.rows[0];
const valid = await bcrypt.compare(password, row.password_hash);
const today = new Date().toISOString().split("T")[0];
const hasPremium =
  Boolean(row.is_subscribed) &&
  (!row.subscription_end || row.subscription_end >= today);

console.log(
  JSON.stringify(
    {
      ok: valid,
      passwordValid: valid,
      isSubscribed: Boolean(row.is_subscribed),
      subscriptionEnd: row.subscription_end,
      planId: row.plan_id,
      hasPremiumAccess: valid && hasPremium,
    },
    null,
    2
  )
);
