import type { Database } from "sql.js";
import { dbQueryAll, dbQueryOne, dbRun } from "./query";

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

export { useTurso } from "./turso";
export { dbRun, dbQueryOne, dbQueryAll, dbPersist } from "./query";

export async function getDb(): Promise<Database> {
  const { getDb: getSqlJsDb } = await import("./sqljs");
  return getSqlJsDb();
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

async function expireSubscriptionIfNeeded(user: DbUser): Promise<DbUser> {
  if (!user.isSubscribed || !user.subscriptionEnd) return user;

  const today = new Date().toISOString().split("T")[0];
  if (user.subscriptionEnd >= today) return user;

  const now = new Date().toISOString();
  await dbRun(`UPDATE users SET is_subscribed = 0, updated_at = ? WHERE id = ?`, [
    now,
    user.id,
  ]);
  return { ...user, isSubscribed: false };
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const row = await dbQueryOne("SELECT * FROM users WHERE email = ?", [email]);
  if (!row) return null;
  return expireSubscriptionIfNeeded(rowToUser(row));
}

export async function findUserById(id: string): Promise<DbUser | null> {
  const row = await dbQueryOne("SELECT * FROM users WHERE id = ?", [id]);
  if (!row) return null;
  return expireSubscriptionIfNeeded(rowToUser(row));
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string
): Promise<DbUser> {
  const now = new Date().toISOString();
  const memberSince = now.split("T")[0];
  const id = crypto.randomUUID();

  await dbRun(
    `INSERT INTO users (
      id, email, name, password_hash, member_since,
      is_subscribed, subscription_end, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?)`,
    [id, email, name, passwordHash, memberSince, now, now]
  );

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
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO login_logs (user_id, email, logged_in_at, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, email, now, ipAddress ?? null, userAgent ?? null]
  );
}

export async function activateSubscription(
  email: string,
  endDate: string,
  planId?: string
): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) return;

  const now = new Date().toISOString();
  const startedAt = now.split("T")[0];

  await dbRun(
    `UPDATE users
     SET is_subscribed = 1,
         subscription_end = ?,
         plan_id = COALESCE(?, plan_id),
         updated_at = ?
     WHERE email = ?`,
    [endDate, planId ?? null, now, email]
  );

  await dbRun(
    `INSERT INTO subscriptions (
      user_id, plan_id, started_at, ends_at, event_type, created_at
    ) VALUES (?, ?, ?, ?, 'initial', ?)`,
    [user.id, planId ?? user.planId ?? null, startedAt, endDate, now]
  );
}

export async function getLoginLogs(userId?: string): Promise<LoginLog[]> {
  const sql = userId
    ? "SELECT * FROM login_logs WHERE user_id = ? ORDER BY logged_in_at DESC"
    : "SELECT * FROM login_logs ORDER BY logged_in_at DESC";
  const params = userId ? [userId] : [];
  const rows = await dbQueryAll(sql, params);

  return rows.map((row) => ({
    id: row.id as number,
    userId: row.user_id as string,
    email: row.email as string,
    loggedInAt: row.logged_in_at as string,
    ipAddress: (row.ip_address as string | null) ?? null,
    userAgent: (row.user_agent as string | null) ?? null,
  }));
}

export interface PendingPayment {
  merchantOrderNo: string;
  userEmail: string;
  planId: string;
  amountTwd: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export async function createPendingPayment(
  merchantOrderNo: string,
  userEmail: string,
  planId: string,
  amountTwd: number
): Promise<void> {
  const now = new Date().toISOString();
  await dbRun(
    `INSERT INTO pending_payments (
      merchant_order_no, user_email, plan_id, amount_twd, status, created_at
    ) VALUES (?, ?, ?, ?, 'pending', ?)`,
    [merchantOrderNo, userEmail, planId, amountTwd, now]
  );
}

export async function findPendingPayment(
  merchantOrderNo: string
): Promise<PendingPayment | null> {
  const row = await dbQueryOne(
    "SELECT * FROM pending_payments WHERE merchant_order_no = ?",
    [merchantOrderNo]
  );
  if (!row) return null;
  return {
    merchantOrderNo: row.merchant_order_no as string,
    userEmail: row.user_email as string,
    planId: row.plan_id as string,
    amountTwd: row.amount_twd as number,
    status: row.status as string,
    createdAt: row.created_at as string,
    paidAt: (row.paid_at as string | null) ?? null,
  };
}

export async function markPendingPaymentPaid(
  merchantOrderNo: string
): Promise<boolean> {
  const pending = await findPendingPayment(merchantOrderNo);
  if (!pending || pending.status === "paid") return false;

  const now = new Date().toISOString();
  await dbRun(
    `UPDATE pending_payments SET status = 'paid', paid_at = ? WHERE merchant_order_no = ?`,
    [now, merchantOrderNo]
  );
  return true;
}

export async function getAllMembers(): Promise<
  Omit<DbUser, "passwordHash">[]
> {
  const rows = await dbQueryAll("SELECT * FROM users ORDER BY member_since DESC");
  const members: Omit<DbUser, "passwordHash">[] = [];

  for (const row of rows) {
    const user = await expireSubscriptionIfNeeded(rowToUser(row));
    const { passwordHash: _, ...safeUser } = user;
    members.push(safeUser);
  }

  return members;
}
