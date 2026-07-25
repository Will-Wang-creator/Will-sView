/**
 * Translate article locale JSON files from English.
 * Uses Google Translate unofficial endpoint (no API key).
 *
 * Run:
 *   node scripts/translate-article-locales.mjs              # all locales, all articles
 *   node scripts/translate-article-locales.mjs ja           # one locale, all articles
 *   node scripts/translate-article-locales.mjs my-slug      # one article, all locales
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, "../src/lib/data/articles/locales");

const LOCALE_MAP = {
  ja: "ja",
  ko: "ko",
  "zh-TW": "zh-TW",
  "zh-CN": "zh-CN",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
};

const CATEGORY_MAP = {
  "Deep Dive": {
    ja: "ディープダイブ",
    ko: "심층 분석",
    "zh-TW": "深度專題",
    "zh-CN": "深度专题",
    es: "Análisis profundo",
    fr: "Analyse approfondie",
    de: "Deep Dive",
    pt: "Análise aprofundada",
  },
  Trends: {
    ja: "トレンド",
    ko: "트렌드",
    "zh-TW": "趨勢",
    "zh-CN": "趋势",
    es: "Tendencias",
    fr: "Tendances",
    de: "Trends",
    pt: "Tendências",
  },
  "Engineering Culture": {
    ja: "エンジニアリング文化",
    ko: "엔지니어링 문화",
    "zh-TW": "工程文化",
    "zh-CN": "工程文化",
    es: "Cultura de ingeniería",
    fr: "Culture d'ingénierie",
    de: "Engineering-Kultur",
    pt: "Cultura de engenharia",
  },
  Career: {
    ja: "キャリア",
    ko: "커리어",
    "zh-TW": "職涯",
    "zh-CN": "职业",
    es: "Carrera",
    fr: "Carrière",
    de: "Karriere",
    pt: "Carreira",
  },
  Industry: {
    ja: "業界",
    ko: "산업",
    "zh-TW": "產業",
    "zh-CN": "产业",
    es: "Industria",
    fr: "Industrie",
    de: "Branche",
    pt: "Indústria",
  },
  "Best Practices": {
    ja: "ベストプラクティス",
    ko: "모범 사례",
    "zh-TW": "最佳實踐",
    "zh-CN": "最佳实践",
    es: "Mejores prácticas",
    fr: "Bonnes pratiques",
    de: "Best Practices",
    pt: "Melhores práticas",
  },
  Compensation: {
    ja: "報酬",
    ko: "보상",
    "zh-TW": "薪酬",
    "zh-CN": "薪酬",
    es: "Compensación",
    fr: "Rémunération",
    de: "Vergütung",
    pt: "Remuneração",
  },
  Leadership: {
    ja: "リーダーシップ",
    ko: "리더십",
    "zh-TW": "領導力",
    "zh-CN": "领导力",
    es: "Liderazgo",
    fr: "Leadership",
    de: "Führung",
    pt: "Liderança",
  },
  Infrastructure: {
    ja: "インフラ",
    ko: "인프라",
    "zh-TW": "基礎設施",
    "zh-CN": "基础设施",
    es: "Infraestructura",
    fr: "Infrastructure",
    de: "Infrastruktur",
    pt: "Infraestrutura",
  },
  "Org Design": {
    ja: "組織設計",
    ko: "조직 설계",
    "zh-TW": "組織設計",
    "zh-CN": "组织设计",
    es: "Diseño organizacional",
    fr: "Design organisationnel",
    de: "Organisationsdesign",
    pt: "Design organizacional",
  },
  Policy: {
    ja: "政策",
    ko: "정책",
    "zh-TW": "政策",
    "zh-CN": "政策",
    es: "Política",
    fr: "Politique",
    de: "Richtlinien",
    pt: "Política",
  },
  Hiring: {
    ja: "採用",
    ko: "채용",
    "zh-TW": "招聘",
    "zh-CN": "招聘",
    es: "Contratación",
    fr: "Recrutement",
    de: "Einstellung",
    pt: "Contratação",
  },
};

function translateReadTime(text, locale) {
  const m = text.match(/(\d+)\s*min/);
  if (!m) return text;
  const n = m[1];
  const labels = {
    ja: `${n} 分`,
    ko: `${n}분`,
    "zh-TW": `${n} 分鐘`,
    "zh-CN": `${n} 分钟`,
    es: `${n} min`,
    fr: `${n} min`,
    de: `${n} Min.`,
    pt: `${n} min`,
  };
  return labels[locale] ?? text;
}

async function translateText(text, to) {
  if (!text?.trim()) return text;

  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    let splitAt = remaining.lastIndexOf("\n\n", 3500);
    if (splitAt < 500) splitAt = Math.min(3500, remaining.length);
    const chunk = remaining.slice(0, splitAt);
    remaining = remaining.slice(splitAt);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Translate failed: ${res.status}`);
    const data = await res.json();
    chunks.push(data[0].map((part) => part[0]).join(""));
    await new Promise((r) => setTimeout(r, 250));
  }
  return chunks.join("");
}

async function translateArticle(article, locale, to) {
  const out = { ...article };
  out.category =
    CATEGORY_MAP[article.category]?.[locale] ?? article.category;
  out.readTime = translateReadTime(article.readTime, locale);

  for (const field of ["title", "excerpt", "preview", "content"]) {
    process.stdout.write(`    ${field}...`);
    out[field] = await translateText(article[field], to);
    process.stdout.write(" done\n");
  }

  out.tags = article.tags;
  return out;
}

async function translateLocale(locale, slugFilter) {
  const filePath = path.join(localesDir, `${locale}.json`);
  const to = LOCALE_MAP[locale];
  const articles = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const slugs = slugFilter ? [slugFilter] : Object.keys(articles);

  console.log(`\nTranslating ${locale} (${slugs.length} article(s))...`);

  for (const slug of slugs) {
    if (!articles[slug]) {
      console.warn(`  Skipping ${slug} — not found in ${locale}.json`);
      continue;
    }
    console.log(`  ${slug}`);
    articles[slug] = await translateArticle(articles[slug], locale, to);
  }

  fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), "utf8");
  console.log(`Saved ${locale}.json`);
}

async function translateSlugAcrossLocales(slug) {
  console.log(`Translating slug "${slug}" across all locales...`);
  for (const locale of Object.keys(LOCALE_MAP)) {
    await translateLocale(locale, slug);
  }
}

const target = process.argv[2];

if (!target) {
  for (const locale of Object.keys(LOCALE_MAP)) {
    await translateLocale(locale);
  }
} else if (LOCALE_MAP[target]) {
  await translateLocale(target);
} else {
  await translateSlugAcrossLocales(target);
}
