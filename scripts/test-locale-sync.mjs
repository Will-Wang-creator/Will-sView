#!/usr/bin/env node
/**
 * Verify article locale overlays are synced with English sources.
 *   node scripts/test-locale-sync.mjs
 *   TEST_URL=https://willsview.dev node scripts/test-locale-sync.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadExistingArticles, parseArticleFile } from "./lib/articles.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/lib/data/articles/locales");
const LOCALES = ["ja", "ko", "zh-TW", "zh-CN", "es", "fr", "de", "pt"];
const TEST_URL = process.env.TEST_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function cjkRatio(text) {
  if (!text?.trim()) return 0;
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  return cjk / text.length;
}

async function main() {
  console.log("\n=== Locale file sync ===\n");

  const articles = loadExistingArticles();
  const slugs = articles.map((a) => a.slug);

  for (const locale of LOCALES) {
    const filePath = path.join(localesDir, `${locale}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const keys = Object.keys(data);

    for (const slug of slugs) {
      assert(`${locale}: has ${slug}`, !!data[slug], "missing overlay");
    }

    const extras = keys.filter((k) => !slugs.includes(k));
    if (extras.length) {
      assert(`${locale}: no orphan slugs`, false, extras.join(", "));
    } else {
      assert(`${locale}: no orphan slugs`, true);
    }
  }

  console.log("\n=== Translation quality (zh-TW sample) ===\n");

  const zhTW = JSON.parse(
    fs.readFileSync(path.join(localesDir, "zh-TW.json"), "utf8")
  );

  for (const slug of slugs) {
    const en = articles.find((a) => a.slug === slug);
    const loc = zhTW[slug];
    const titleTranslated = loc?.title && loc.title !== en.title;
    const contentCjk = cjkRatio(loc?.content?.slice(0, 500) || "");
    assert(
      `zh-TW ${slug} title translated`,
      titleTranslated,
      loc?.title?.slice(0, 40)
    );
    assert(
      `zh-TW ${slug} content has Chinese`,
      contentCjk > 0.05,
      `ratio ${(contentCjk * 100).toFixed(1)}%`
    );
  }

  console.log(`\n=== Production SSR locale (${TEST_URL}) ===\n`);

  try {
    const res = await fetch(`${TEST_URL}/articles/building-cursor-inside-story`, {
      headers: { Cookie: "locale=zh-TW" },
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    assert("Production article page loads", res.status === 200);
    assert(
      "SSR html lang is zh-Hant with locale cookie",
      html.includes('lang="zh-Hant"'),
      'expected lang="zh-Hant"'
    );
    const expectedTitle = zhTW["building-cursor-inside-story"]?.title;
    assert(
      "SSR includes localized article title",
      expectedTitle && html.includes(expectedTitle),
      expectedTitle?.slice(0, 30)
    );
  } catch (err) {
    assert("Production reachable", false, err.message);
  }

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
