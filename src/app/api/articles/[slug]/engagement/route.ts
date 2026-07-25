import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getComments,
  addComment,
  getLikeCount,
  isLiked,
  toggleLike,
} from "@/lib/engagement";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const user = await getSession();

  return NextResponse.json({
    likes: await getLikeCount(slug),
    liked: await isLiked(slug, user?.id),
    comments: await getComments(slug),
  });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const body = await req.json();
  const user = await getSession();

  if (body.action === "like") {
    if (!user) {
      return NextResponse.json({ error: "Sign in to like" }, { status: 401 });
    }
    const result = await toggleLike(slug, user.id);
    return NextResponse.json(result);
  }

  if (body.action === "comment") {
    if (!user) {
      return NextResponse.json({ error: "Sign in to comment" }, { status: 401 });
    }
    if (!body.text?.trim()) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
    }

    const comment = await addComment(slug, user.id, user.name, body.text);
    return NextResponse.json({ comment });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
