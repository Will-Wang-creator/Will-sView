/**
 * Initialize Turso schema (run once after creating the database).
 *
 * Usage:
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node scripts/init-turso.mjs
 */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first.");
  process.exit(1);
}

const client = createClient({ url, authToken });

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    member_since TEXT NOT NULL,
    is_subscribed INTEGER NOT NULL DEFAULT 0,
    subscription_end TEXT,
    plan_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    logged_in_at TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    plan_id TEXT,
    started_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    event_type TEXT NOT NULL DEFAULT 'initial',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS article_likes (
    user_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, slug)
  )`,
  `CREATE TABLE IF NOT EXISTS article_comments (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS article_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    slug TEXT NOT NULL,
    viewed_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS pending_payments (
    merchant_order_no TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    amount_twd INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    paid_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,
];

for (const sql of statements) {
  await client.execute(sql);
}

const count = await client.execute("SELECT COUNT(*) as count FROM users");
const n = Number(count.rows[0]?.count ?? 0);
console.log(`Schema ready. Users in database: ${n}`);
