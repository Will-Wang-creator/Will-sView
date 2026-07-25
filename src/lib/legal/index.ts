import type { Locale } from "@/lib/i18n/locales";
import type { LegalContent } from "./types";
import en from "./en";
import zhTW from "./zh-TW";
import zhCN from "./zh-CN";

const legalByLocale: Partial<Record<Locale, LegalContent>> = {
  en,
  "zh-TW": zhTW,
  "zh-CN": zhCN,
};

export function getLegalContent(locale: Locale): LegalContent {
  return legalByLocale[locale] ?? en;
}

export type { LegalContent, LegalDocument, LegalSection } from "./types";
