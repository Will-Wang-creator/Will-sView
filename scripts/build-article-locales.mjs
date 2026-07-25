import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const articlesDir = path.join(__dirname, "../src/lib/data/articles");
const localesDir = path.join(articlesDir, "locales");

function parseArticleFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const slug = text.match(/slug:\s*"([^"]+)"/)?.[1];
  if (!slug) return null;

  const field = (name) => {
    const quoted = text.match(new RegExp(`${name}:\\s*"((?:\\\\.|[^"\\\\])*)"`));
    if (quoted) return quoted[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    const backtick = text.match(
      new RegExp(`${name}:\\s*\`([\\s\\S]*?)\`(?:\\.trim\\(\\))?\\s*,`)
    );
    if (backtick) return backtick[1].trim();
    return "";
  };

  const tagsMatch = text.match(/tags:\s*\[([\s\S]*?)\]/);
  const tags = tagsMatch
    ? [...tagsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
    : [];

  return {
    title: field("title"),
    excerpt: field("excerpt"),
    category: field("category"),
    readTime: field("readTime"),
    preview: field("preview"),
    content: field("content"),
    tags,
  };
}

function loadEnglishArticles() {
  const files = fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".ts") && !["index.ts", "types.ts"].includes(f));

  const articles = {};
  for (const f of files) {
    const parsed = parseArticleFile(path.join(articlesDir, f));
    if (parsed) {
      const slug = f.replace(".ts", "");
      articles[slug] = parsed;
      if (!parsed.content) {
        console.warn(`Warning: empty content for ${slug}`);
      }
    }
  }
  return articles;
}

const LOCALES = ["ja", "ko", "zh-TW", "zh-CN", "es", "fr", "de", "pt"];

const english = loadEnglishArticles();
fs.mkdirSync(localesDir, { recursive: true });

for (const locale of LOCALES) {
  const outPath = path.join(localesDir, `${locale}.json`);
  fs.writeFileSync(outPath, JSON.stringify(english, null, 2), "utf8");
  console.log(`Wrote ${locale}.json (${Object.keys(english).length} articles)`);
}

console.log(`Done: ${Object.keys(english).length} English articles extracted`);
