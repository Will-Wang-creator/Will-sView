import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { recordArticleView } from "@/lib/engagement";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await recordArticleView(slug, user.id);
  return NextResponse.json({ ok: true });
}
