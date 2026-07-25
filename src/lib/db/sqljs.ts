import fs from "fs";
import path from "path";
import type { Database, SqlJsStatic } from "sql.js";
import bcrypt from "bcryptjs";

function resolveDbDir(): string {
  if (process.env.DATA_DIR?.trim()) {
    return process.env.DATA_DIR.trim();
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "willsview-data");
  }
  return path.join(process.cwd(), "data");
}

const DB_DIR = resolveDbDir();
const DB_PATH = path.join(DB_DIR, "insight.db");

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;
let dbMtime = 0;

function getFileMtime(): number {
  if (!fs.existsSync(DB_PATH)) return 0;
  return fs.statSync(DB_PATH).mtimeMs;
}

export function persistDb(): void {
  if (!db) return;
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  dbMtime = fs.statSync(DB_PATH).mtimeMs;
}

function initSchema(database: Database): void {
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      member_since TEXT NOT NULL,
      is_subscribed INTEGER NOT NULL DEFAULT 0,
      subscription_end TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS login_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      logged_in_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      plan_id TEXT,
      started_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      event_type TEXT NOT NULL DEFAULT 'initial',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS article_likes (
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, slug)
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS article_comments (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS article_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      viewed_at TEXT NOT NULL
    )
  `);
  database.run(
    "CREATE INDEX IF NOT EXISTS idx_article_views_user ON article_views(user_id, viewed_at DESC)"
  );

  database.run(`
    CREATE TABLE IF NOT EXISTS pending_payments (
      merchant_order_no TEXT PRIMARY KEY,
      user_email TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      amount_twd INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      paid_at TEXT
    )
  `);

  database.run(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  migrateSchema(database);
}

function migrateSchema(database: Database): void {
  const columns = new Set<string>();
  const info = database.exec("PRAGMA table_info(users)");
  if (info[0]) {
    for (const row of info[0].values) {
      columns.add(row[1] as string);
    }
  }

  if (!columns.has("plan_id")) {
    database.run("ALTER TABLE users ADD COLUMN plan_id TEXT");
  }

  const subInfo = database.exec("PRAGMA table_info(subscriptions)");
  const subColumns = new Set<string>();
  if (subInfo[0]) {
    for (const row of subInfo[0].values) {
      subColumns.add(row[1] as string);
    }
  }
  if (!subColumns.has("event_type")) {
    database.run(
      "ALTER TABLE subscriptions ADD COLUMN event_type TEXT NOT NULL DEFAULT 'initial'"
    );
  }
}

function seedDemoUsers(database: Database): void {
  const result = database.exec("SELECT COUNT(*) as count FROM users");
  const count = result[0]?.values[0]?.[0] as number;
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
    database.run(
      `INSERT INTO users (
        id, email, name, password_hash, member_since,
        is_subscribed, subscription_end, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.email,
        user.name,
        user.passwordHash,
        user.memberSince,
        user.isSubscribed,
        user.subscriptionEnd,
        now,
        now,
      ]
    );
  }
}

export async function getDb(): Promise<Database> {
  if (!SQL) {
    const initSqlJs = (await import("sql.js")).default;
    SQL = await initSqlJs({
      locateFile: (file) =>
        path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
    });
  }

  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  const mtime = getFileMtime();
  if (db && mtime > 0 && mtime === dbMtime) {
    return db;
  }

  if (db) {
    db.close();
    db = null;
  }

  if (mtime > 0) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
    initSchema(db);
    dbMtime = mtime;
    return db;
  }

  db = new SQL.Database();
  initSchema(db);
  seedDemoUsers(db);
  persistDb();
  return db;
}

export function queryOne(
  database: Database,
  sql: string,
  params: (string | number | null)[] = []
): Record<string, unknown> | null {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  return row;
}

export function queryAll(
  database: Database,
  sql: string,
  params: (string | number | null)[] = []
): Record<string, unknown>[] {
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}
