import { getDb } from "@/lib/db";

export interface Comment {
  id: string;
  slug: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

export interface UserActivityItem {
  slug: string;
  createdAt: string;
  body?: string;
}

export async function initEngagementSchema(): Promise<void> {
  const database = await getDb();
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

  await resetSeededEngagementOnce();
}

export async function getLikeCount(slug: string): Promise<number> {
  await initEngagementSchema();
  const database = await getDb();
  const stmt = database.prepare(
    "SELECT COUNT(*) as count FROM article_likes WHERE slug = ?"
  );
  stmt.bind([slug]);
  stmt.step();
  const count = stmt.getAsObject().count as number;
  stmt.free();
  return count;
}

export async function isLiked(slug: string, userId?: string): Promise<boolean> {
  if (!userId) return false;
  await initEngagementSchema();
  const database = await getDb();
  const stmt = database.prepare(
    "SELECT 1 FROM article_likes WHERE slug = ? AND user_id = ?"
  );
  stmt.bind([slug, userId]);
  const found = stmt.step();
  stmt.free();
  return found;
}

export async function toggleLike(
  slug: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  await initEngagementSchema();
  const database = await getDb();
  const now = new Date().toISOString();
  const exists = await isLiked(slug, userId);

  if (exists) {
    database.run("DELETE FROM article_likes WHERE slug = ? AND user_id = ?", [
      slug,
      userId,
    ]);
  } else {
    database.run(
      "INSERT INTO article_likes (user_id, slug, created_at) VALUES (?, ?, ?)",
      [userId, slug, now]
    );
  }

  const { persist } = await import("@/lib/db/engagement-persist");
  persist(database);

  const count = await getLikeCount(slug);
  return { liked: !exists, count };
}

export async function getComments(slug: string): Promise<Comment[]> {
  await initEngagementSchema();
  const database = await getDb();
  const stmt = database.prepare(
    "SELECT * FROM article_comments WHERE slug = ? ORDER BY created_at DESC"
  );
  stmt.bind([slug]);
  const results: Comment[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id as string,
      slug: row.slug as string,
      userId: row.user_id as string,
      userName: row.user_name as string,
      body: row.body as string,
      createdAt: row.created_at as string,
    });
  }
  stmt.free();
  return results;
}

export async function addComment(
  slug: string,
  userId: string,
  userName: string,
  body: string
): Promise<Comment> {
  await initEngagementSchema();
  const database = await getDb();
  const comment: Comment = {
    id: `${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
    slug,
    userId,
    userName,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };

  database.run(
    `INSERT INTO article_comments (id, slug, user_id, user_name, body, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      comment.id,
      comment.slug,
      comment.userId,
      comment.userName,
      comment.body,
      comment.createdAt,
    ]
  );

  const { persist } = await import("@/lib/db/engagement-persist");
  persist(database);

  return comment;
}

export async function recordArticleView(
  slug: string,
  userId: string
): Promise<void> {
  await initEngagementSchema();
  const database = await getDb();
  const now = new Date().toISOString();

  database.run(
    "INSERT INTO article_views (user_id, slug, viewed_at) VALUES (?, ?, ?)",
    [userId, slug, now]
  );

  const { persist } = await import("@/lib/db/engagement-persist");
  persist(database);
}

export async function getUserLikes(userId: string): Promise<UserActivityItem[]> {
  await initEngagementSchema();
  const database = await getDb();
  const stmt = database.prepare(
    "SELECT slug, created_at as createdAt FROM article_likes WHERE user_id = ? ORDER BY created_at DESC"
  );
  stmt.bind([userId]);
  const results: UserActivityItem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      slug: row.slug as string,
      createdAt: row.createdAt as string,
    });
  }
  stmt.free();
  return results;
}

export async function getUserComments(userId: string): Promise<UserActivityItem[]> {
  await initEngagementSchema();
  const database = await getDb();
  const stmt = database.prepare(
    `SELECT slug, body, created_at as createdAt
     FROM article_comments WHERE user_id = ? ORDER BY created_at DESC`
  );
  stmt.bind([userId]);
  const results: UserActivityItem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      slug: row.slug as string,
      body: row.body as string,
      createdAt: row.createdAt as string,
    });
  }
  stmt.free();
  return results;
}

export async function getUserViews(userId: string): Promise<UserActivityItem[]> {
  await initEngagementSchema();
  const database = await getDb();
  const stmt = database.prepare(
    `SELECT slug, MAX(viewed_at) as createdAt
     FROM article_views WHERE user_id = ?
     GROUP BY slug ORDER BY createdAt DESC`
  );
  stmt.bind([userId]);
  const results: UserActivityItem[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      slug: row.slug as string,
      createdAt: row.createdAt as string,
    });
  }
  stmt.free();
  return results;
}

async function resetSeededEngagementOnce(): Promise<void> {
  const database = await getDb();

  database.run(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const stmt = database.prepare(
    "SELECT value FROM app_meta WHERE key = 'engagement_reset_v1'"
  );
  stmt.bind([]);
  const alreadyReset = stmt.step()
    ? (stmt.getAsObject().value as string) === "1"
    : false;
  stmt.free();

  if (alreadyReset) return;

  database.run("DELETE FROM article_likes");
  database.run("DELETE FROM article_comments");
  database.run("DELETE FROM article_views");
  database.run(
    "INSERT OR REPLACE INTO app_meta (key, value) VALUES ('engagement_reset_v1', '1')"
  );

  const { persist } = await import("@/lib/db/engagement-persist");
  persist(database);
}
