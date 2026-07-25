import { useTurso, tursoRun, tursoQueryOne, tursoQueryAll } from "./turso";

export { useTurso };

export async function dbRun(
  sql: string,
  args: (string | number | null)[] = []
): Promise<void> {
  if (useTurso()) {
    await tursoRun(sql, args);
    return;
  }
  const { getDb, persistDb } = await import("./sqljs");
  const database = await getDb();
  database.run(sql, args);
  persistDb();
}

export async function dbQueryOne(
  sql: string,
  args: (string | number | null)[] = []
): Promise<Record<string, unknown> | null> {
  if (useTurso()) {
    return tursoQueryOne(sql, args);
  }
  const { getDb, queryOne } = await import("./sqljs");
  const database = await getDb();
  return queryOne(database, sql, args);
}

export async function dbQueryAll(
  sql: string,
  args: (string | number | null)[] = []
): Promise<Record<string, unknown>[]> {
  if (useTurso()) {
    return tursoQueryAll(sql, args);
  }
  const { getDb, queryAll } = await import("./sqljs");
  const database = await getDb();
  return queryAll(database, sql, args);
}

export async function dbPersist(): Promise<void> {
  if (useTurso()) return;
  const { getDb, persistDb } = await import("./sqljs");
  await getDb();
  persistDb();
}
