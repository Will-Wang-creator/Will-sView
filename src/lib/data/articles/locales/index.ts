import type { Locale } from "@/lib/i18n/locales";
import type { ArticleLocaleContent } from "../types";

import ja from "./ja.json";
import ko from "./ko.json";
import zhTW from "./zh-TW.json";
import zhCN from "./zh-CN.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";
import pt from "./pt.json";

type LocaleOverlayMap = Record<string, ArticleLocaleContent>;

const CATEGORY_LABELS: Record<string, Partial<Record<Locale, string>>> = {
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
};

const overlays: Partial<Record<Locale, LocaleOverlayMap>> = {
  ja: ja as LocaleOverlayMap,
  ko: ko as LocaleOverlayMap,
  "zh-TW": zhTW as LocaleOverlayMap,
  "zh-CN": zhCN as LocaleOverlayMap,
  es: es as LocaleOverlayMap,
  fr: fr as LocaleOverlayMap,
  de: de as LocaleOverlayMap,
  pt: pt as LocaleOverlayMap,
};

function localizeCategory(category: string, locale: Locale): string {
  return CATEGORY_LABELS[category]?.[locale] ?? category;
}

export function getArticleLocaleContent(
  slug: string,
  locale: Locale
): ArticleLocaleContent | undefined {
  if (locale === "en") return undefined;
  const content = overlays[locale]?.[slug];
  if (!content) return undefined;
  return {
    ...content,
    category: localizeCategory(content.category, locale),
  };
}
