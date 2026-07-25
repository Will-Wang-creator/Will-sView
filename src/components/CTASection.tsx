"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-8 py-16 text-center md:px-16"
      >
        <h2 className="text-3xl font-bold tracking-tight text-black md:text-5xl">
          {t.cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted)]">
          {t.cta.subtitle}
        </p>
        <Link
          href="/pricing"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[#333]"
        >
          {t.cta.subscribe}
          <ArrowRight size={18} />
        </Link>
        <p className="mt-4 text-sm text-[var(--muted)]">{t.cta.priceNote}</p>
      </motion.div>
    </section>
  );
}
