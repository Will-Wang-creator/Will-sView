"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-white px-6 pb-24 pt-20 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-6 text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
            {t.hero.badge}
          </p>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-black md:text-7xl">
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
            {t.hero.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 text-base font-medium text-white transition-all hover:bg-[#333]"
          >
            {t.hero.startReading}
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-8 py-3.5 text-base font-medium transition-colors hover:bg-[var(--surface)]"
          >
            {t.hero.browseFree}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-[var(--muted)]"
        >
          <span>{t.hero.readBy}</span>
          {["Google", "Meta", "Stripe", "Cloudflare", "Linear", "Vercel"].map(
            (company) => (
              <span key={company} className="font-medium text-[var(--foreground)]">
                {company}
              </span>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
