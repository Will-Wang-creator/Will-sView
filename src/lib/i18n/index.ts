import type { Locale } from "./locales";
import type { Translations } from "./types";
import en from "./translations/en";
import ja from "./translations/ja";
import ko from "./translations/ko";
import zhTW from "./translations/zh-TW";
import zhCN from "./translations/zh-CN";
import es from "./translations/es";
import fr from "./translations/fr";
import de from "./translations/de";
import pt from "./translations/pt";

export type { Translations } from "./types";
export {
  locales,
  defaultLocale,
  localeHtmlLang,
  isLocale,
  type Locale,
} from "./locales";

export const translations: Record<Locale, Translations> = {
  en,
  ja,
  ko,
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  es,
  fr,
  de,
  pt,
};

export function getTranslations(locale: Locale): Translations {
  return translations[locale] ?? translations.en;
}

export const LOCALE_COOKIE = "locale";
