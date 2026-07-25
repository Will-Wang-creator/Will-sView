import fs from "fs";
import path from "path";
import type { Database, SqlJsStatic } from "sql.js";
import bcrypt from "bcryptjs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "insight.db");

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;
let dbMtime = 0;

function getFileMtime(): number {
  if (!fs.existsSync(DB_PATH)) return 0;
  return fs.statSync(DB_PATH).mtimeMs;
}

export interface DbUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  memberSince: string;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  planId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginLog {
  id: number;
  userId: string;
  email: string;
  loggedInAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}

function persist(): void {
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
  persist();
  return db;
}

function rowToUser(row: Record<string, unknown>): DbUser {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    passwordHash: row.password_hash as string,
    memberSince: row.member_since as string,
    isSubscribed: Boolean(row.is_subscribed),
    subscriptionEnd: (row.subscription_end as string | null) ?? null,
    planId: (row.plan_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function queryOne(
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

function expireSubscriptionIfNeeded(database: Database, user: DbUser): DbUser {
  if (!user.isSubscribed || !user.subscriptionEnd) return user;

  const today = new Date().toISOString().split("T")[0];
  if (user.subscriptionEnd >= today) return user;

  const now = new Date().toISOString();
  database.run(
    `UPDATE users SET is_subscribed = 0, updated_at = ? WHERE id = ?`,
    [now, user.id]
  );
  persist();
  return { ...user, isSubscribed: false };
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const database = await getDb();
  const row = queryOne(database, "SELECT * FROM users WHERE email = ?", [email]);
  if (!row) return null;
  return expireSubscriptionIfNeeded(database, rowToUser(row));
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const database = await getDb();
  const row = queryOne(database, "SELECT * FROM users WHERE id = ?", [id]);
  if (!row) return null;
  return expireSubscriptionIfNeeded(database, rowToUser(row));
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string
): Promise<DbUser> {
  const database = await getDb();
  const now = new Date().toISOString();
  const memberSince = now.split("T")[0];
  const id = crypto.randomUUID();

  database.run(
    `INSERT INTO users (
      id, email, name, password_hash, member_since,
      is_subscribed, subscription_end, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?)`,
    [id, email, name, passwordHash, memberSince, now, now]
  );
  persist();

  return {
    id,
    email,
    name,
    passwordHash,
    memberSince,
    isSubscribed: false,
    subscriptionEnd: null,
    planId: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function recordLogin(
  userId: string,
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const database = await getDb();
  const now = new Date().toISOString();

  database.run(
    `INSERT INTO login_logs (user_id, email, logged_in_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, email, now, ipAddress ?? null, userAgent ?? null]
  );
  persist();
}

export async function activateSubscription(
  email: string,
  endDate: string,
  planId?: string
): Promise<void> {
  const database = await getDb();
  const user = await findUserByEmail(email);
  if (!user) return;

  const now = new Date().toISOString();
  const startedAt = now.split("T")[0];

  database.run(
    `UPDATE users
     SET is_subscribed = 1,
         subscription_end = ?,
         plan_id = COALESCE(?, plan_id),
         updated_at = ?
     WHERE email = ?`,
    [endDate, planId ?? null, now, email]
  );

  database.run(
    `INSERT INTO subscriptions (
      user_id, plan_id, started_at, ends_at, event_type, created_at
    ) VALUES (?, ?, ?, ?, 'initial', ?)`,
    [user.id, planId ?? user.planId ?? null, startedAt, endDate, now]
  );
  persist();
}

export async function getLoginLogs(userId?: string): Promise<LoginLog[]> {
  const database = await getDb();
  const sql = userId
    ? "SELECT * FROM login_logs WHERE user_id = ? ORDER BY logged_in_at DESC"
    : "SELECT * FROM login_logs ORDER BY logged_in_at DESC";
  const params = userId ? [userId] : [];

  const stmt = database.prepare(sql);
  stmt.bind(params);
  const logs: LoginLog[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    logs.push({
      id: row.id as number,
      userId: row.user_id as string,
      email: row.email as string,
      loggedInAt: row.logged_in_at as string,
      ipAddress: (row.ip_address as string | null) ?? null,
      userAgent: (row.user_agent as string | null) ?? null,
    });
  }
  stmt.free();
  return logs;
}

export async function getAllMembers(): Promise<
  Omit<DbUser, "passwordHash">[]
> {
  const database = await getDb();
  const stmt = database.prepare("SELECT * FROM users ORDER BY member_since DESC");
  const members: Omit<DbUser, "passwordHash">[] = [];

  while (stmt.step()) {
    const user = expireSubscriptionIfNeeded(database, rowToUser(stmt.getAsObject()));
    const { passwordHash: _, ...safeUser } = user;
    members.push(safeUser);
  }
  stmt.free();
  return members;
}
