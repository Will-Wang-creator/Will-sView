#!/usr/bin/env node
/** Remove locale JSON entries for slugs that no longer exist as articles. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadExistingArticles } from "./lib/articles.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/lib/data/articles/locales");
const LOCALES = ["ja", "ko", "zh-TW", "zh-CN", "es", "fr", "de", "pt"];

const validSlugs = new Set(loadExistingArticles().map((a) => a.slug));

for (const locale of LOCALES) {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const orphans = Object.keys(data).filter((k) => !validSlugs.has(k));
  for (const k of orphans) {
    delete data[k];
    console.log(`${locale}: removed orphan ${k}`);
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

console.log("Done pruning orphan locale entries.");
