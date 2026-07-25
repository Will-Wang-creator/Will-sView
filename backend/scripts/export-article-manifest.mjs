import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.join(__dirname, "../../src/lib/data/articles");
const files = fs
  .readdirSync(articlesDir)
  .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "types.ts");

const manifest = {};
for (const file of files) {
  const content = fs.readFileSync(path.join(articlesDir, file), "utf8");
  const slug = content.match(/slug:\s*["']([^"']+)["']/)?.[1];
  const title = content.match(/title:\s*["']([^"']+)["']/)?.[1];
  const excerpt = content.match(/excerpt:\s*\n?\s*["']([^"']+)["']/)?.[1];
  const category = content.match(/category:\s*["']([^"']+)["']/)?.[1];
  const publishedAt = content.match(/publishedAt:\s*["']([^"']+)["']/)?.[1];
  if (slug) {
    manifest[slug] = { title, excerpt, category, publishedAt };
  }
}

const outDir = path.join(__dirname, "../data");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "articles-manifest.json"),
  JSON.stringify(manifest, null, 2)
);
console.log(`Exported ${Object.keys(manifest).length} articles`);
