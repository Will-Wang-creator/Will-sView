#!/usr/bin/env node
/**
 * Generate a weekly article from latest tech news.
 * Run every Friday via GitHub Actions or manually:
 *   node scripts/generate-weekly-article.mjs
 *   node scripts/generate-weekly-article.mjs --force
 *   node scripts/generate-weekly-article.mjs --dry-run
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import {
  articlesDir,
  articleExistsForDate,
  estimateReadTime,
  getNextPublishFridayISO,
  loadExistingArticles,
  mergeArticleIntoLocales,
  renderArticleFile,
  syncArticleIndex,
  validateArticleDepth,
} from "./lib/articles.mjs";
import {
  buildSlugFromTopic,
  fetchNewsCandidates,
  inferCategory,
  inferTags,
  pickBestTopic,
} from "./lib/news.mjs";
import { generateArticleDraft } from "./lib/llm.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

async function main() {
  const publishDate = getNextPublishFridayISO();
  console.log(`Weekly article run for ${publishDate} (Friday)`);

  if (!force && articleExistsForDate(publishDate)) {
    console.log(`Article already exists for ${publishDate}. Use --force to override.`);
    return;
  }

  console.log("Fetching latest tech news...");
  const candidates = await fetchNewsCandidates();
  if (candidates.length === 0) {
    throw new Error("No news candidates found");
  }

  const existing = loadExistingArticles();
  const topic = pickBestTopic(candidates, existing);
  if (!topic) throw new Error("Could not pick a news topic");

  const related = candidates
    .filter((c) => c.title !== topic.title)
    .slice(0, 6);

  console.log(`Selected topic: ${topic.title}`);
  console.log(`  Source: ${topic.source} | ${topic.url}`);

  console.log("Generating article draft...");
  const draft = await generateArticleDraft({
    topic,
    sources: [topic, ...related],
    dateISO: publishDate,
  });

  const depth = validateArticleDepth(draft.content, { strict: true });
  console.log(
    `Draft depth: ${depth.words} words, ${depth.sections} sections, ${depth.quotes} quotes, ${depth.tables} table rows`
  );
  if (!depth.ok) {
    console.warn(`Draft below editorial bar: ${depth.issues.join("; ")}`);
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "Set OPENAI_API_KEY (and optionally OPENAI_MODEL=gpt-4o) for Pragmatic Engineer–quality depth."
      );
    }
  }

  const slug = buildSlugFromTopic(draft.title || topic.title, publishDate);
  const filePath = path.join(articlesDir, `${slug}.ts`);

  if (fs.existsSync(filePath) && !force) {
    console.log(`File ${slug}.ts already exists. Use --force to overwrite.`);
    return;
  }

  const article = {
    slug,
    title: draft.title,
    excerpt: draft.excerpt,
    category: draft.category || inferCategory(topic.title),
    readTime: estimateReadTime(draft.content),
    publishedAt: publishDate,
    isPremium: false,
    preview: draft.preview,
    content: draft.content,
    tags: draft.tags?.length ? draft.tags : inferTags(topic.title, draft.category),
  };

  if (dryRun) {
    console.log("\n--- DRY RUN ---");
    console.log(JSON.stringify({ slug, title: article.title, category: article.category }, null, 2));
    console.log(`Preview: ${article.preview.slice(0, 200)}...`);
    return;
  }

  fs.mkdirSync(articlesDir, { recursive: true });
  fs.writeFileSync(filePath, renderArticleFile(article), "utf8");
  console.log(`Wrote ${filePath}`);

  syncArticleIndex();

  const localeContent = {
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    readTime: article.readTime,
    preview: article.preview,
    content: article.content,
    tags: article.tags,
  };
  mergeArticleIntoLocales(slug, localeContent);
  console.log("Merged English content into locale JSON files");

  console.log("Translating new article into 8 languages (this may take several minutes)...");
  const translate = spawnSync(
    process.execPath,
    ["scripts/translate-article-locales.mjs", slug],
    { cwd: path.join(__dirname, ".."), stdio: "inherit" }
  );
  if (translate.status !== 0) {
    console.warn("Translation step failed — English article was still created.");
  }

  console.log(`\nDone! New article: /articles/${slug}`);
  console.log(`Title: ${article.title}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
