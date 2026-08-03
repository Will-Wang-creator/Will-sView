#!/usr/bin/env node
/**
 * Validate all articles meet Pragmatic Engineer–style depth bar.
 *   node scripts/validate-articles.mjs           # warn on legacy gaps, exit 0
 *   node scripts/validate-articles.mjs --strict  # fail CI if any article below bar
 */
import { loadExistingArticles, validateArticleDepth } from "./lib/articles.mjs";

const strict = process.argv.includes("--strict");
const articles = loadExistingArticles();
let failed = 0;

for (const article of articles) {
  const depth = validateArticleDepth(article.content, { strict });
  const status = depth.ok ? "OK" : "BELOW BAR";
  console.log(
    `[${status}] ${article.slug} — ${depth.words} words, ${depth.sections} sections`
  );
  if (!depth.ok) {
    failed++;
    for (const issue of depth.issues) console.log(`         - ${issue}`);
  }
}

if (failed > 0 && strict) {
  console.error(`\n${failed} article(s) below editorial bar.`);
  process.exit(1);
}

if (failed > 0) {
  console.warn(`\n${failed} article(s) below bar (non-strict mode — exit 0).`);
} else {
  console.log(`\nAll ${articles.length} articles pass depth validation.`);
}
