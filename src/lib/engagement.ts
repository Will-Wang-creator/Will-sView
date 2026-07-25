import { dbQueryAll, dbQueryOne, dbRun } from "@/lib/db";

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
  await dbRun(`
    CREATE TABLE IF NOT EXISTS article_likes (
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, slug)
    )
  `);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS article_comments (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS article_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      viewed_at TEXT NOT NULL
    )
  `);
  await dbRun(
    "CREATE INDEX IF NOT EXISTS idx_article_views_user ON article_views(user_id, viewed_at DESC)"
  );

  await resetSeededEngagementOnce();
}

export async function getLikeCount(slug: string): Promise<number> {
  await initEngagementSchema();
  const row = await dbQueryOne(
    "SELECT COUNT(*) as count FROM article_likes WHERE slug = ?",
    [slug]
  );
  return Number(row?.count ?? 0);
}

export async function isLiked(slug: string, userId?: string): Promise<boolean> {
  if (!userId) return false;
  await initEngagementSchema();
  const row = await dbQueryOne(
    "SELECT 1 as found FROM article_likes WHERE slug = ? AND user_id = ?",
    [slug, userId]
  );
  return Boolean(row);
}

export async function toggleLike(
  slug: string,
  userId: string
): Promise<{ liked: boolean; count: number }> {
  await initEngagementSchema();
  const exists = await isLiked(slug, userId);

  if (exists) {
    await dbRun("DELETE FROM article_likes WHERE slug = ? AND user_id = ?", [
      slug,
      userId,
    ]);
  } else {
    await dbRun(
      "INSERT INTO article_likes (user_id, slug, created_at) VALUES (?, ?, ?)",
      [userId, slug, new Date().toISOString()]
    );
  }

  const count = await getLikeCount(slug);
  return { liked: !exists, count };
}

export async function getComments(slug: string): Promise<Comment[]> {
  await initEngagementSchema();
  const rows = await dbQueryAll(
    "SELECT * FROM article_comments WHERE slug = ? ORDER BY created_at DESC",
    [slug]
  );

  return rows.map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    userId: row.user_id as string,
    userName: row.user_name as string,
    body: row.body as string,
    createdAt: row.created_at as string,
  }));
}

export async function addComment(
  slug: string,
  userId: string,
  userName: string,
  body: string
): Promise<Comment> {
  await initEngagementSchema();
  const comment: Comment = {
    id: `${Date.now()}${Math.random().toString(36).slice(2, 7)}`,
    slug,
    userId,
    userName,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };

  await dbRun(
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

  return comment;
}

export async function recordArticleView(
  slug: string,
  userId: string
): Promise<void> {
  await initEngagementSchema();
  await dbRun(
    "INSERT INTO article_views (user_id, slug, viewed_at) VALUES (?, ?, ?)",
    [userId, slug, new Date().toISOString()]
  );
}

export async function getUserLikes(userId: string): Promise<UserActivityItem[]> {
  await initEngagementSchema();
  const rows = await dbQueryAll(
    "SELECT slug, created_at as createdAt FROM article_likes WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return rows.map((row) => ({
    slug: row.slug as string,
    createdAt: row.createdAt as string,
  }));
}

export async function getUserComments(userId: string): Promise<UserActivityItem[]> {
  await initEngagementSchema();
  const rows = await dbQueryAll(
    `SELECT slug, body, created_at as createdAt
     FROM article_comments WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    slug: row.slug as string,
    body: row.body as string,
    createdAt: row.createdAt as string,
  }));
}

export async function getUserViews(userId: string): Promise<UserActivityItem[]> {
  await initEngagementSchema();
  const rows = await dbQueryAll(
    `SELECT slug, MAX(viewed_at) as createdAt
     FROM article_views WHERE user_id = ?
     GROUP BY slug ORDER BY createdAt DESC`,
    [userId]
  );

  return rows.map((row) => ({
    slug: row.slug as string,
    createdAt: row.createdAt as string,
  }));
}

async function resetSeededEngagementOnce(): Promise<void> {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const row = await dbQueryOne(
    "SELECT value FROM app_meta WHERE key = 'engagement_reset_v1'"
  );
  if (row?.value === "1") return;

  await dbRun("DELETE FROM article_likes");
  await dbRun("DELETE FROM article_comments");
  await dbRun("DELETE FROM article_views");
  await dbRun(
    "INSERT OR REPLACE INTO app_meta (key, value) VALUES ('engagement_reset_v1', '1')"
  );
}
