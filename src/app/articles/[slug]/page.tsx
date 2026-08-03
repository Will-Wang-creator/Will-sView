import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle } from "@/lib/data/articles";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { ArticlePageContent } from "@/components/ArticlePageContent";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const article = getArticle(slug, locale);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const article = getArticle(slug, locale);
  if (!article) notFound();

  const user = await getSession();
  const canRead = !article.isPremium || !!user?.isSubscribed;

  return (
    <ArticlePageContent
      slug={slug}
      canRead={canRead}
      user={user ? { id: user.id, name: user.name } : null}
      article={article}
    />
  );
}
