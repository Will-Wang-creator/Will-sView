import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const articlesDir = path.join(__dirname, "../../src/lib/data/articles");
export const localesDir = path.join(articlesDir, "locales");
export const indexPath = path.join(articlesDir, "index.ts");

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

export function getMondayISO(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export function parseArticleFile(filePath) {
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

  const publishedAt = text.match(/publishedAt:\s*"([^"]+)"/)?.[1] ?? "";
  const isPremium = /isPremium:\s*true/.test(text);

  return {
    slug,
    title: field("title"),
    excerpt: field("excerpt"),
    category: field("category"),
    readTime: field("readTime"),
    preview: field("preview"),
    content: field("content"),
    tags,
    publishedAt,
    isPremium,
  };
}

export function loadExistingArticles() {
  if (!fs.existsSync(articlesDir)) return [];

  return fs
    .readdirSync(articlesDir)
    .filter((f) => f.endsWith(".ts") && !["index.ts", "types.ts"].includes(f))
    .map((f) => parseArticleFile(path.join(articlesDir, f)))
    .filter(Boolean);
}

export function articleExistsForDate(dateISO) {
  return loadExistingArticles().some((a) => a.publishedAt === dateISO);
}

export function escapeTsString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function estimateReadTime(content) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(12, Math.min(35, Math.round(words / 220)));
  return `${minutes} min`;
}

export function toImportName(slug) {
  return slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

export function renderArticleFile(article) {
  const tags = article.tags.map((t) => `"${escapeTsString(t)}"`).join(", ");
  return `import type { Article } from "./types";

export const article: Article = {
  slug: "${escapeTsString(article.slug)}",
  title: "${escapeTsString(article.title)}",
  excerpt:
    "${escapeTsString(article.excerpt)}",
  category: "${escapeTsString(article.category)}",
  readTime: "${escapeTsString(article.readTime)}",
  publishedAt: "${escapeTsString(article.publishedAt)}",
  isPremium: ${article.isPremium ? "true" : "false"},
  preview:
    "${escapeTsString(article.preview)}",
  tags: [${tags}],
  content: \`
${article.content.trim()}
  \`.trim(),
};
`;
}

export function syncArticleIndex() {
  const articles = loadExistingArticles().sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const imports = articles
    .map((a) => {
      const name = toImportName(a.slug);
      return `import { article as ${name} } from "./${a.slug}";`;
    })
    .join("\n");

  const array = articles
    .map((a) => `  ${toImportName(a.slug)},`)
    .join("\n");

  const content = `import type { Article } from "./types";
import type { Locale } from "@/lib/i18n/locales";
import { defaultLocale } from "@/lib/i18n/locales";
import { getArticleLocaleContent } from "./locales";
${imports}

export type { Article, ArticleLocaleContent } from "./types";

export const articles: Article[] = [
${array}
];

function localizeArticle(article: Article, locale: Locale): Article {
  const overlay = getArticleLocaleContent(article.slug, locale);
  if (!overlay) return article;
  return { ...article, ...overlay };
}

export function getSortedArticles(locale: Locale = defaultLocale): Article[] {
  return [...articles]
    .map((a) => localizeArticle(a, locale))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function getArticle(
  slug: string,
  locale: Locale = defaultLocale
): Article | undefined {
  const article = articles.find((a) => a.slug === slug);
  if (!article) return undefined;
  return localizeArticle(article, locale);
}

export function getPublicArticles(locale: Locale = defaultLocale): Article[] {
  return getSortedArticles(locale).filter((a) => !a.isPremium);
}

export function getPremiumArticles(locale: Locale = defaultLocale): Article[] {
  return getSortedArticles(locale).filter((a) => a.isPremium);
}
`;

  fs.writeFileSync(indexPath, content, "utf8");
  console.log(`Synced index.ts (${articles.length} articles)`);
}

export function mergeArticleIntoLocales(slug, localeContent) {
  const LOCALES = ["ja", "ko", "zh-TW", "zh-CN", "es", "fr", "de", "pt"];
  fs.mkdirSync(localesDir, { recursive: true });

  for (const locale of LOCALES) {
    const filePath = path.join(localesDir, `${locale}.json`);
    const data = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, "utf8"))
      : {};
    data[slug] = localeContent;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }
}
