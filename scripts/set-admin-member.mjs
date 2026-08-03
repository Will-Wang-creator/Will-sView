/**
 * Create or update a platform admin account with full member/subscription access.
 *
 * This app has no separate admin role — premium access is controlled by
 * users.is_subscribed + subscription_end. This script upserts a user with
 * an active annual subscription (same privileges as demo@example.com).
 *
 * Usage (reads .env.local for Turso credentials):
 *   node scripts/set-admin-member.mjs --email you@example.com --password secret --name "Admin"
 *
 * Or via env vars:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME=... node scripts/set-admin-member.mjs
 */
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
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

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--email" || arg === "-e") out.email = argv[++i];
    else if (arg === "--password" || arg === "-p") out.password = argv[++i];
    else if (arg === "--name" || arg === "-n") out.name = argv[++i];
    else if (arg === "--help" || arg === "-h") out.help = true;
  }
  return out;
}

function printHelp() {
  console.log(`Usage:
  node scripts/set-admin-member.mjs --email EMAIL --password PASS [--name "Display Name"]

Environment (from .env.local or shell):
  TURSO_DATABASE_URL, TURSO_AUTH_TOKEN — required
  ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME — optional alternatives to CLI flags
`);
}

loadEnvLocal();

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const email = (args.email || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = (args.password || process.env.ADMIN_PASSWORD || "").trim();
const name = (args.name || process.env.ADMIN_NAME || "Platform Admin").trim();
const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!email || !password) {
  console.error("Provide --email and --password (or ADMIN_EMAIL / ADMIN_PASSWORD).");
  printHelp();
  process.exit(1);
}

if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local or the environment.");
  process.exit(1);
}

const client = createClient({ url, authToken });
const now = new Date().toISOString();
const memberSince = now.split("T")[0];
const subscriptionEnd = "2099-12-31";
const planId = "annual";
const passwordHash = await bcrypt.hash(password, 10);

const existing = await client.execute({
  sql: "SELECT id, email, is_subscribed, subscription_end FROM users WHERE email = ?",
  args: [email],
});

let userId;
let action;

if (existing.rows.length > 0) {
  userId = existing.rows[0].id;
  action = "updated";
  await client.execute({
    sql: `UPDATE users SET
      name = ?,
      password_hash = ?,
      is_subscribed = 1,
      subscription_end = ?,
      plan_id = ?,
      updated_at = ?
    WHERE email = ?`,
    args: [name, passwordHash, subscriptionEnd, planId, now, email],
  });
} else {
  userId = crypto.randomUUID();
  action = "created";
  await client.execute({
    sql: `INSERT INTO users (
      id, email, name, password_hash, member_since,
      is_subscribed, subscription_end, plan_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
    args: [
      userId,
      email,
      name,
      passwordHash,
      memberSince,
      subscriptionEnd,
      planId,
      now,
      now,
    ],
  });
}

await client.execute({
  sql: `INSERT INTO subscriptions (
    user_id, plan_id, started_at, ends_at, event_type, created_at
  ) VALUES (?, ?, ?, ?, 'admin_grant', ?)`,
  args: [userId, planId, memberSince, subscriptionEnd, now],
});

await client.execute({
  sql: "INSERT OR REPLACE INTO app_meta (key, value) VALUES ('platform_admin_email', ?)",
  args: [email],
});

const verify = await client.execute({
  sql: "SELECT email, name, is_subscribed, subscription_end, plan_id FROM users WHERE email = ?",
  args: [email],
});

const row = verify.rows[0];
console.log(JSON.stringify({
  ok: true,
  action,
  email: row.email,
  name: row.name,
  isSubscribed: Boolean(row.is_subscribed),
  subscriptionEnd: row.subscription_end,
  planId: row.plan_id,
}, null, 2));
