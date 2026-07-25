import type { Locale } from "@/lib/i18n/locales";

export function getDateLocale(locale: Locale): string {
  if (locale === "zh-TW" || locale === "zh-CN") return locale;
  if (locale === "pt") return "pt-BR";
  return locale;
}

export function formatArticleDate(publishedAt: string, locale: Locale): string {
  return new Date(publishedAt).toLocaleDateString(getDateLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
