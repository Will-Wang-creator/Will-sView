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
    slug,
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
      const { slug, ...content } = parsed;
      articles[slug] = content;
      if (!content.content) {
        console.warn(`Warning: empty content for ${slug}`);
      }
    }
  }
  return articles;
}

const LOCALES = ["ja", "ko", "zh-TW", "zh-CN", "es", "fr", "de", "pt"];

const english = loadEnglishArticles();
fs.mkdirSync(localesDir, { recursive: true });

let added = 0;
let preserved = 0;

for (const locale of LOCALES) {
  const outPath = path.join(localesDir, `${locale}.json`);
  const existing = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, "utf8"))
    : {};

  const merged = { ...existing };

  for (const [slug, content] of Object.entries(english)) {
    if (!merged[slug]) {
      merged[slug] = content;
      added++;
    } else {
      preserved++;
    }
  }

  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), "utf8");
  console.log(
    `Wrote ${locale}.json (${Object.keys(merged).length} articles, preserved existing translations)`
  );
}

console.log(
  `Done: ${Object.keys(english).length} English articles; ${added} new locale entries added across files`
);
