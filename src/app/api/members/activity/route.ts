import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { proxyToBackend } from "@/lib/api-proxy";
import {
  getUserComments,
  getUserLikes,
  getUserViews,
} from "@/lib/engagement";
import { getArticle } from "@/lib/data/articles";

export async function GET(req: NextRequest) {
  const proxied = await proxyToBackend(req, "/api/members/activity");
  if (proxied) return proxied;

  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  const [likes, comments, views] = await Promise.all([
    getUserLikes(user.id),
    getUserComments(user.id),
    getUserViews(user.id),
  ]);

  function enrich<T extends { slug: string }>(items: T[]) {
    return items
      .map((item) => {
        const article = getArticle(item.slug);
        if (!article) return null;
        return {
          ...item,
          title: article.title,
          excerpt: article.excerpt,
          category: article.category,
          publishedAt: article.publishedAt,
        };
      })
      .filter(Boolean)
      .filter((item) => {
        if (!query) return true;
        return (
          item!.title.toLowerCase().includes(query) ||
          item!.excerpt.toLowerCase().includes(query) ||
          (item as { body?: string }).body?.toLowerCase().includes(query)
        );
      });
  }

  return NextResponse.json({
    likes: enrich(likes),
    comments: enrich(comments),
    views: enrich(views),
  });
}
