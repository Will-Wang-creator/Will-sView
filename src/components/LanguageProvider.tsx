"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  defaultLocale,
  getTranslations,
  isLocale,
  LOCALE_COOKIE,
  localeHtmlLang,
  type Locale,
  type Translations,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function persistLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
  try {
    localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // ignore
  }
  document.documentElement.lang = localeHtmlLang[locale];
}

export function LanguageProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_COOKIE);
      if (stored && isLocale(stored) && stored !== locale) {
        setLocaleState(stored);
        document.documentElement.lang = localeHtmlLang[stored];
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      persistLocale(next);
      router.refresh();
    },
    [router]
  );

  const value = useMemo(
    () => ({
      locale,
      t: getTranslations(locale),
      setLocale,
    }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function useTranslation() {
  return useLanguage();
}
