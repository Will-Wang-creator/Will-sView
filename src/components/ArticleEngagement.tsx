"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

interface Comment {
  id: string;
  userName: string;
  body: string;
  createdAt: string;
}

interface ArticleEngagementProps {
  slug: string;
  title: string;
  user?: { id: string; name: string } | null;
}

function shareLinks(title: string, url: string) {
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  return {
    x: `https://twitter.com/intent/tweet?text=${text}&url=${link}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
    slack: `https://slack.com/share?url=${link}&text=${text}`,
  };
}

export function ArticleEngagement({ slug, title, user }: ArticleEngagementProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [error, setError] = useState("");

  const fetchEngagement = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${slug}/engagement`);
      const data = await res.json();
      setLikes(data.likes);
      setLiked(data.liked);
      setComments(data.comments);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  async function handleLike() {
    if (!user) {
      router.push(`/login?returnTo=/articles/${slug}`);
      return;
    }

    setLikeLoading(true);
    try {
      const res = await fetch(`/api/articles/${slug}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like" }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/login?returnTo=/articles/${slug}`);
        return;
      }
      if (res.ok) {
        setLikes(data.count);
        setLiked(data.liked);
      }
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/articles/${slug}/engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t.engagement.failedComment);
        return;
      }
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/articles/${slug}`;

  const links = shareLinks(title, pageUrl);

  return (
    <div className="mt-12 border-t border-[var(--border)] pt-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleLike}
          disabled={likeLoading}
          aria-pressed={liked}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
            liked
              ? "border-black bg-black text-white"
              : "border-[var(--border)] hover:border-black/30"
          }`}
        >
          {likeLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Heart size={16} className={liked ? "fill-current" : ""} />
          )}
          {likes > 0 ? likes : t.engagement.like}
        </button>

        <a
          href="#comments"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:border-black/30"
        >
          <MessageCircle size={16} />
          {comments.length > 0 ? comments.length : t.engagement.discuss}
        </a>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShareOpen(!shareOpen)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium transition-colors hover:border-black/30"
          >
            <Share2 size={16} />
            {t.engagement.share}
          </button>
          {shareOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShareOpen(false)}
                aria-hidden
              />
              <div className="absolute left-0 top-full z-20 mt-2 min-w-[160px] rounded-xl border border-[var(--border)] bg-white py-2 shadow-lg">
                <a
                  href={links.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm hover:bg-[var(--surface)]"
                  onClick={() => setShareOpen(false)}
                >
                  {t.engagement.shareX}
                </a>
                <a
                  href={links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm hover:bg-[var(--surface)]"
                  onClick={() => setShareOpen(false)}
                >
                  {t.engagement.shareLinkedIn}
                </a>
                <a
                  href={links.slack}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 text-sm hover:bg-[var(--surface)]"
                  onClick={() => setShareOpen(false)}
                >
                  {t.engagement.shareSlack}
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      <section id="comments" className="mt-10">
        <h2 className="text-lg font-semibold text-black">
          {t.engagement.discussion} ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleComment} className="mt-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.engagement.placeholder}
              rows={3}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="mt-3 rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-[#333] disabled:opacity-50"
            >
              {submitting ? t.engagement.posting : t.engagement.postComment}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">
            <Link href={`/login?returnTo=/articles/${slug}`} className="text-black underline hover:no-underline">
              {t.nav.signIn}
            </Link>{" "}
            {t.engagement.signInToDiscuss}
          </p>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-[var(--muted)]">{t.engagement.loadingComments}</p>
        ) : comments.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--muted)]">{t.engagement.noComments}</p>
        ) : (
          <ul className="mt-6 space-y-4">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-black">
                    {comment.userName}
                  </span>
                  <time
                    dateTime={comment.createdAt}
                    className="text-xs text-[var(--muted)]"
                  >
                    {new Date(comment.createdAt).toLocaleDateString(
                      locale === "zh-TW" || locale === "zh-CN" ? locale : locale === "pt" ? "pt-BR" : locale,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </time>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {comment.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
