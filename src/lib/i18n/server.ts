import { cookies } from "next/headers";
import {
  defaultLocale,
  getTranslations,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "./index";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  if (value && isLocale(value)) return value;
  return defaultLocale;
}

export async function getServerTranslations() {
  const locale = await getLocale();
  return { locale, t: getTranslations(locale) };
}
