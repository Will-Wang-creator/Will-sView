"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { SITE_NAME, SOCIAL_LINKS, SITE_CONTACT_EMAIL } from "@/lib/site";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="section-divider bg-white">
      <div className="bg-[var(--surface)] px-6 py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
            <div>
              <h2 className="font-serif text-2xl leading-snug tracking-tight md:text-3xl">
                {t.cta.title}
              </h2>
              <p className="mt-3 max-w-sm text-sm text-[var(--muted)]">
                {t.cta.subtitle}
              </p>
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-full border border-[var(--border)] bg-white py-4 pl-6 pr-40 text-sm outline-none transition-colors focus:border-[var(--muted-light)]"
              />
              <Link
                href="/pricing"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[var(--foreground)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
              >
                {t.cta.subscribe}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
              Will&apos;s<span className="text-[var(--muted)]">View</span>
              <span className="text-[var(--accent-blue)]">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              {t.footer.tagline}
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
              <a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">
                X
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">
                LinkedIn
              </a>
              <a href={SOCIAL_LINKS.slack} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">
                Slack
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {t.footer.content}
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--muted)]">
              <li><Link href="/articles" className="hover:text-[var(--foreground)]">{t.footer.allArticles}</Link></li>
              <li><Link href="/pricing" className="hover:text-[var(--foreground)]">{t.footer.pricing}</Link></li>
              <li><Link href="/members" className="hover:text-[var(--foreground)]">{t.footer.memberArea}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {t.footer.connect}
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--muted)]">
              <li><a href={SOCIAL_LINKS.x} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">{t.footer.twitter}</a></li>
              <li><a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">{t.footer.linkedin}</a></li>
              <li><a href={SOCIAL_LINKS.slack} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--foreground)]">{t.footer.slack}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              Legal
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/privacy" className="hover:text-[var(--foreground)]">{t.footer.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--foreground)]">{t.footer.terms}</Link></li>
              <li>
                <a
                  href={`mailto:${SITE_CONTACT_EMAIL}`}
                  className="hover:text-[var(--foreground)]"
                >
                  {t.footer.contactUs}: {SITE_CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted)] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. {t.footer.copyright}</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition-colors hover:bg-white"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
