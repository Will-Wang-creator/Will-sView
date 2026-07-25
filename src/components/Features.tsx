"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Newspaper,
  Users,
  MessageSquare,
  BookMarked,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

const icons = [BookOpen, Newspaper, Users, MessageSquare, BookMarked, TrendingUp];

export function Features() {
  const { t } = useTranslation();

  return (
    <section className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black md:text-5xl">
            {t.features.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {t.features.benefits.map((benefit, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-[var(--border)] bg-white p-8 transition-shadow hover:shadow-sm"
              >
                <div className="mb-4 inline-flex rounded-xl bg-[var(--surface)] p-3">
                  {Icon && <Icon size={24} className="text-black" />}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
