import fs from "fs";
import path from "path";
import type { Database } from "sql.js";

const DB_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "insight.db");

export function persist(database: Database): void {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(database.export()));
}
