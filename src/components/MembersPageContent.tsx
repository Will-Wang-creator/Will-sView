"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, MessageSquare, History, Search, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { formatArticleDate } from "@/lib/format-date";

interface ActivityArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  createdAt: string;
  body?: string;
}

interface MembersPageContentProps {
  user: {
    id: string;
    name: string;
    isSubscribed: boolean;
    memberSince: string;
    subscriptionEnd: string | null;
  };
}

type ActivityTab = "likes" | "comments" | "views";

export function MembersPageContent({ user }: MembersPageContentProps) {
  const { t, locale } = useTranslation();
  const dateLocale =
    locale === "zh-TW" || locale === "zh-CN"
      ? locale
      : locale === "pt"
        ? "pt-BR"
        : locale;

  const [tab, setTab] = useState<ActivityTab>("likes");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<ActivityArticle[]>([]);
  const [comments, setComments] = useState<ActivityArticle[]>([]);
  const [views, setViews] = useState<ActivityArticle[]>([]);

  const fetchActivity = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const res = await fetch(`/api/members/activity${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setLikes(data.likes ?? []);
      setComments(data.comments ?? []);
      setViews(data.views ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchActivity(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search, fetchActivity]);

  const tabs = useMemo(
    () =>
      [
        { id: "likes" as const, label: t.members.tabs.likes, icon: Heart, count: likes.length },
        { id: "comments" as const, label: t.members.tabs.comments, icon: MessageSquare, count: comments.length },
        { id: "views" as const, label: t.members.tabs.views, icon: History, count: views.length },
      ],
    [t, likes.length, comments.length, views.length]
  );

  const activeItems =
    tab === "likes" ? likes : tab === "comments" ? comments : views;

  const emptyMessage =
    tab === "likes"
      ? t.members.empty.likes
      : tab === "comments"
        ? t.members.empty.comments
        : t.members.empty.views;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          {t.members.welcome.replace("{name}", user.name)}
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          {user.isSubscribed ? t.members.fullAccess : t.members.upgradePrompt}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
          <span>
            {t.members.memberSince}{" "}
            {new Date(user.memberSince).toLocaleDateString(dateLocale, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {user.isSubscribed && user.subscriptionEnd && (
            <span>
              {t.members.subscriptionUntil}{" "}
              {new Date(user.subscriptionEnd).toLocaleDateString(dateLocale, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
        {!user.isSubscribed && (
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-[#333]"
          >
            {t.members.upgradePremium}
          </Link>
        )}
      </div>

      <section>
        <div className="relative mb-6">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.members.searchPlaceholder}
            className="w-full rounded-2xl border border-[var(--border)] bg-white py-3 pl-11 pr-4 text-sm text-black outline-none transition-colors focus:border-black/30"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                tab === id
                  ? "border-black bg-black text-white"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-black/20 hover:text-black"
              }`}
            >
              <Icon size={16} />
              {label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  tab === id ? "bg-white/20" : "bg-black/10"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-sm text-[var(--muted)]">
            <Loader2 size={16} className="animate-spin" />
            {t.members.loadingActivity}
          </div>
        ) : activeItems.length === 0 ? (
          <p className="py-12 text-sm text-[var(--muted)]">{emptyMessage}</p>
        ) : (
          <div className="space-y-4">
            {activeItems.map((item) => (
              <Link
                key={`${tab}-${item.slug}-${item.createdAt}`}
                href={`/articles/${item.slug}`}
                className="group block rounded-xl border border-[var(--border)] bg-white p-5 transition-all hover:border-black/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-[var(--muted)]">
                      {item.category} · {formatArticleDate(item.publishedAt, locale)}
                    </span>
                    <h3 className="mt-1 font-medium text-black group-hover:underline">
                      {item.title}
                    </h3>
                    {tab === "comments" && item.body && (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                        {item.body}
                      </p>
                    )}
                    {tab !== "comments" && (
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                  <time
                    dateTime={item.createdAt}
                    className="shrink-0 text-xs text-[var(--muted)]"
                  >
                    {formatArticleDate(item.createdAt.slice(0, 10), locale)}
                  </time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
