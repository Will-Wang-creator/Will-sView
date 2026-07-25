"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { getSortedArticles } from "@/lib/data/articles";
import { useTranslation } from "@/components/LanguageProvider";
import { formatArticleDate } from "@/lib/format-date";

export function PopularArticles() {
  const { t, locale } = useTranslation();
  const popular = getSortedArticles(locale).slice(0, 4);

  return (
    <section className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t.popularArticles.title}
            </h2>
            <p className="mt-2 text-[var(--muted)]">{t.popularArticles.subtitle}</p>
          </div>
          <Link
            href="/articles"
            className="hidden items-center gap-1 text-sm font-medium text-black hover:underline md:flex"
          >
            {t.popularArticles.viewAll} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {popular.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/articles/${article.slug}`}
                className="group block rounded-2xl border border-[var(--border)] bg-white p-6 transition-all hover:border-black/20 hover:shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium">
                    {article.category}
                  </span>
                  {article.isPremium && (
                    <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                      <Lock size={12} /> {t.popularArticles.premium}
                    </span>
                  )}
                  <span className="text-xs text-[var(--muted)]">
                    {formatArticleDate(article.publishedAt, locale)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-black group-hover:underline">
                  {article.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                  {article.excerpt}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
