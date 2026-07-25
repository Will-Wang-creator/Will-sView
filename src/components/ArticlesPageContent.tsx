"use client";

import Link from "next/link";
import { Lock, Calendar } from "lucide-react";
import { getSortedArticles } from "@/lib/data/articles";
import { useTranslation } from "@/components/LanguageProvider";
import { formatArticleDate } from "@/lib/format-date";

export function ArticlesPageContent() {
  const { t, locale } = useTranslation();
  const articles = getSortedArticles(locale);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight text-black">{t.articles.title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
        {t.articles.subtitle}
      </p>
      <Link
        href="/pricing"
        className="mt-4 inline-block text-sm font-medium text-black underline hover:no-underline"
      >
        {t.articles.membershipLink}
      </Link>

      <div className="mt-12 space-y-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group block rounded-2xl border border-[var(--border)] bg-white p-6 transition-all hover:border-black/20 hover:shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium">
                {article.category}
              </span>
              {article.isPremium && (
                <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                  <Lock size={12} /> {t.articles.premium}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                <Calendar size={12} /> {formatArticleDate(article.publishedAt, locale)}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-black group-hover:underline">
              {article.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {article.excerpt}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--muted)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
