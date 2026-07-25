"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/site";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-semibold tracking-tight text-black">
              Will&apos;s<span className="text-[var(--muted)]">View</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">{t.footer.content}</h4>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li>
                <Link href="/articles" className="hover:text-[var(--foreground)]">
                  {t.footer.allArticles}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--foreground)]">
                  {t.footer.pricing}
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-[var(--foreground)]">
                  {t.footer.memberArea}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">{t.footer.connect}</h4>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li>
                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)]"
                >
                  {t.footer.twitter}
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)]"
                >
                  {t.footer.linkedin}
                </a>
              </li>
              <li>
                <a
                  href={SOCIAL_LINKS.slack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--foreground)]"
                >
                  {t.footer.slack}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 text-sm text-[var(--muted)] md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. {t.footer.copyright}
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-[var(--foreground)]">
              {t.footer.privacy}
            </Link>
            <Link href="/terms" className="hover:text-[var(--foreground)]">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
