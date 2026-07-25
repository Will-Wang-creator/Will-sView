"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

export default function SubscribeSuccessPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-6 inline-flex rounded-full bg-green-500/10 p-4">
        <CheckCircle size={48} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-black">
        {t.subscribeSuccess.title}
      </h1>
      <p className="mt-4 text-[var(--muted)]">{t.subscribeSuccess.description}</p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/members"
          className="rounded-full bg-black px-8 py-3 text-sm font-medium text-white hover:bg-[#333]"
        >
          {t.subscribeSuccess.memberArea}
        </Link>
        <Link
          href="/articles"
          className="rounded-full border border-[var(--border)] px-8 py-3 text-sm font-medium hover:bg-[var(--surface)]"
        >
          {t.subscribeSuccess.browseArticles}
        </Link>
      </div>
    </div>
  );
}
