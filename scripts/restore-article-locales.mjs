/**
 * Restore article locale translations wiped by a full build-locales overwrite.
 * Merges translations from a git commit with newer slugs from current files.
 *
 *   node scripts/restore-article-locales.mjs
 *   node scripts/restore-article-locales.mjs --from 066d416
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/lib/data/articles/locales");
const LOCALES = ["ja", "ko", "zh-TW", "zh-CN", "es", "fr", "de", "pt"];

const fromCommit =
  process.argv.find((a) => a.startsWith("--from="))?.split("=")[1] ??
  (process.argv.includes("--from")
    ? process.argv[process.argv.indexOf("--from") + 1]
    : "066d416");

const gitExe =
  process.env.GIT_EXE ??
  "C:\\Users\\User\\AppData\\Local\\GitHubDesktop\\app-3.6.3\\resources\\app\\git\\cmd\\git.exe";

function readLocaleFromGit(commit, locale) {
  const rel = `src/lib/data/articles/locales/${locale}.json`;
  const raw = execSync(`"${gitExe}" show ${commit}:${rel}`, {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
  });
  return JSON.parse(raw);
}

function readCurrentLocale(locale) {
  const filePath = path.join(localesDir, `${locale}.json`);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

console.log(`Restoring locale translations from ${fromCommit}...`);

for (const locale of LOCALES) {
  const restored = readLocaleFromGit(fromCommit, locale);
  const current = readCurrentLocale(locale);
  const merged = { ...restored };

  for (const [slug, content] of Object.entries(current)) {
    if (!merged[slug]) {
      merged[slug] = content;
      console.log(`  ${locale}: added new slug ${slug}`);
    }
  }

  const outPath = path.join(localesDir, `${locale}.json`);
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), "utf8");
  console.log(`Saved ${locale}.json (${Object.keys(merged).length} articles)`);
}

console.log("Restore complete.");
