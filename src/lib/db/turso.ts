import { createClient, type Client } from "@libsql/client";
import bcrypt from "bcryptjs";

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

export function useTurso(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL?.trim());
}

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

function rowRecord(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value;
  }
  return out;
}

export async function tursoRun(
  sql: string,
  args: (string | number | null)[] = []
): Promise<void> {
  await ensureSchema();
  await getClient().execute({ sql, args });
}

export async function tursoQueryOne(
  sql: string,
  args: (string | number | null)[] = []
): Promise<Record<string, unknown> | null> {
  await ensureSchema();
  const result = await getClient().execute({ sql, args });
  if (result.rows.length === 0) return null;
  return rowRecord(result.rows[0] as Record<string, unknown>);
}

export async function tursoQueryAll(
  sql: string,
  args: (string | number | null)[] = []
): Promise<Record<string, unknown>[]> {
  await ensureSchema();
  const result = await getClient().execute({ sql, args });
  return result.rows.map((row) => rowRecord(row as Record<string, unknown>));
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = initSchema();
  }
  await schemaReady;
}

async function initSchema(): Promise<void> {
  const c = getClient();

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      member_since TEXT NOT NULL,
      is_subscribed INTEGER NOT NULL DEFAULT 0,
      subscription_end TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      logged_in_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      plan_id TEXT,
      started_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'initial',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
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
    `CREATE INDEX IF NOT EXISTS idx_article_views_user ON article_views(user_id, viewed_at DESC)`,
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
    await c.execute(sql);
  }

  const info = await c.execute("PRAGMA table_info(users)");
  const columns = new Set(
    info.rows.map((row) => (row as Record<string, unknown>).name as string)
  );
  if (!columns.has("plan_id")) {
    await c.execute("ALTER TABLE users ADD COLUMN plan_id TEXT");
  }

  const subInfo = await c.execute("PRAGMA table_info(subscriptions)");
  const subColumns = new Set(
    subInfo.rows.map((row) => (row as Record<string, unknown>).name as string)
  );
  if (!subColumns.has("event_type")) {
    await c.execute(
      "ALTER TABLE subscriptions ADD COLUMN event_type TEXT NOT NULL DEFAULT 'initial'"
    );
  }

  await seedDemoUsers(c);
}

async function seedDemoUsers(c: Client): Promise<void> {
  const countRow = await c.execute("SELECT COUNT(*) as count FROM users");
  const count = Number(
    (countRow.rows[0] as Record<string, unknown>).count ?? 0
  );
  if (count > 0) return;

  const now = new Date().toISOString();
  const demoUsers = [
    {
      id: "1",
      email: "demo@example.com",
      name: "Demo Member",
      passwordHash: bcrypt.hashSync("demo1234", 10),
      memberSince: "2025-06-01",
      isSubscribed: 1,
      subscriptionEnd: "2027-01-01",
    },
    {
      id: "2",
      email: "free@example.com",
      name: "Free User",
      passwordHash: bcrypt.hashSync("demo1234", 10),
      memberSince: "2026-01-15",
      isSubscribed: 0,
      subscriptionEnd: null,
    },
  ];

  for (const user of demoUsers) {
    await c.execute({
      sql: `INSERT INTO users (
        id, email, name, password_hash, member_since,
        is_subscribed, subscription_end, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        user.id,
        user.email,
        user.name,
        user.passwordHash,
        user.memberSince,
        user.isSubscribed,
        user.subscriptionEnd,
        now,
        now,
      ],
    });
  }
}
