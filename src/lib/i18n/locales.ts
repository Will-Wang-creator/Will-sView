export const locales = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  { code: "ko", label: "Korean", nativeLabel: "한국어" },
  { code: "zh-TW", label: "Traditional Chinese", nativeLabel: "繁體中文" },
  { code: "zh-CN", label: "Simplified Chinese", nativeLabel: "简体中文" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
] as const;

export type Locale = (typeof locales)[number]["code"];

export const defaultLocale: Locale = "en";

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  ja: "ja",
  ko: "ko",
  "zh-TW": "zh-Hant",
  "zh-CN": "zh-Hans",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
};

export function isLocale(value: string): value is Locale {
  return locales.some((l) => l.code === value);
}
