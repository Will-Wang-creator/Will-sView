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

export function getFridayISO(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day <= 5 ? 5 - day : 5 - day + 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Next Friday on or after today, strictly after the latest published article. */
export function getNextPublishFridayISO(date = new Date()) {
  const articles = loadExistingArticles();
  const latest = articles.reduce(
    (max, a) => (a.publishedAt > max ? a.publishedAt : max),
    "1970-01-01"
  );

  let d = new Date(latest);
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== 5) {
    d.setDate(d.getDate() + 1);
  }

  const today = new Date(date);
  today.setHours(0, 0, 0, 0);

  while (d < today) {
    d.setDate(d.getDate() + 7);
  }

  return d.toISOString().slice(0, 10);
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
  const minutes = Math.max(18, Math.min(40, Math.round(words / 200)));
  return `${minutes} min`;
}

/** Minimum editorial bar aligned with Pragmatic Engineer–style depth. */
export function validateArticleDepth(content, { strict = false } = {}) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const sections = (content.match(/^## /gm) || []).length;
  const quotes = (content.match(/^> /gm) || []).length;
  const separatorTables = (content.match(/\n\|[-: |]+\|\n/g) || []).length;
  const tablePipes = (content.match(/\|/g) || []).length;
  const hasTable = separatorTables >= 1 || tablePipes >= 6;
  const hasTodayWeCover = /\*\*Today, we cover:\*\*/.test(content);
  const hasTakeaways = /^## Takeaways/m.test(content);

  const minWords = strict ? 2200 : 2000;
  const minSections = strict ? 6 : 5;

  const issues = [];
  if (words < minWords) issues.push(`word count ${words} < ${minWords}`);
  if (sections < minSections) issues.push(`sections ${sections} < ${minSections}`);
  if (quotes < 2) issues.push(`blockquotes ${quotes} < 2`);
  if (!hasTable) issues.push("missing markdown table");
  if (!hasTodayWeCover) issues.push('missing "**Today, we cover:**" section');
  if (!hasTakeaways) issues.push('missing "## Takeaways" section');

  return {
    words,
    sections,
    quotes,
    tables: hasTable ? 1 : 0,
    ok: issues.length === 0,
    issues,
  };
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
