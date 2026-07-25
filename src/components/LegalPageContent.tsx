"use client";

import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";
import { getLegalContent } from "@/lib/legal";

export function LegalPageContent({ type }: { type: "privacy" | "terms" }) {
  const { locale, t } = useTranslation();
  const legal = getLegalContent(locale);
  const content = type === "privacy" ? legal.privacy : legal.terms;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
        {content.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{content.updated}</p>

      {content.intro && (
        <p className="mt-8 text-[var(--foreground)] leading-relaxed">
          {content.intro}
        </p>
      )}

      <div className="mt-10 space-y-10">
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-black">{section.heading}</h2>
            <div className="mt-3 space-y-3 text-[var(--foreground)] leading-relaxed">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      {type === "privacy" && (
        <p className="mt-12 text-sm text-[var(--muted)]">
          <Link href="/terms" className="underline hover:text-black">
            {t.footer.terms}
          </Link>
        </p>
      )}
      {type === "terms" && (
        <p className="mt-12 text-sm text-[var(--muted)]">
          <Link href="/privacy" className="underline hover:text-black">
            {t.footer.privacy}
          </Link>
        </p>
      )}
    </div>
  );
}
