"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Lock, Calendar, ArrowLeft } from "lucide-react";
import { getArticle } from "@/lib/data/articles";
import { useTranslation } from "@/components/LanguageProvider";
import { Paywall } from "@/components/Paywall";
import { ArticleEngagement } from "@/components/ArticleEngagement";
import { renderMarkdown } from "@/lib/markdown";
import { formatArticleDate } from "@/lib/format-date";

interface ArticlePageContentProps {
  slug: string;
  canRead: boolean;
  user: { id: string; name: string } | null;
}

export function ArticlePageContent({
  slug,
  canRead,
  user,
}: ArticlePageContentProps) {
  const { locale, t } = useTranslation();
  const article = getArticle(slug, locale);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/articles/${slug}/view`, { method: "POST" }).catch(() => {});
  }, [slug, user]);

  if (!article) return null;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/articles"
        className="mb-8 inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={16} /> {t.articles.backLink}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
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

      <h1 className="text-3xl font-bold leading-tight tracking-tight text-black md:text-4xl">
        {article.title}
      </h1>
      <p className="mt-4 text-lg text-[var(--muted)]">{article.excerpt}</p>

      <div className="mt-8 border-t border-[var(--border)] pt-8">
        <div className="prose-content">
          <p>{article.preview}</p>
        </div>

        {canRead ? (
          <div
            className="prose-content mt-6"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(article.content),
            }}
          />
        ) : (
          <Paywall />
        )}
      </div>

      <ArticleEngagement slug={article.slug} title={article.title} user={user} />
    </article>
  );
}
