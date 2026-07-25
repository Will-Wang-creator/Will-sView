import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/lib/data/articles");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".ts") && !["index.ts", "types.ts"].includes(f));

const manifest = [];
for (const f of files) {
  const slug = f.replace(".ts", "");
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  const title = text.match(/title:\s*"([^"]+)"/)?.[1];
  manifest.push({ slug, title });
}

console.log(JSON.stringify(manifest, null, 2));
