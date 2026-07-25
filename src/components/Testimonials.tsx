"use client";

import { motion } from "framer-motion";
import { testimonials } from "@/lib/data/testimonials";
import { useTranslation } from "@/components/LanguageProvider";

export function Testimonials() {
  const { t } = useTranslation();

  return (
    <section className="bg-[var(--surface)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black md:text-5xl">
            {t.testimonials.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <motion.blockquote
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-6"
            >
              <p className="flex-1 text-sm leading-relaxed text-[var(--muted)]">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-4 border-t border-[var(--border)] pt-4">
                <p className="text-sm font-semibold text-black">{item.author}</p>
                <p className="text-xs text-[var(--muted)]">
                  {item.role}, {item.company}
                </p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
