"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { pricingPlans } from "@/lib/data/pricing";
import { formatPrice } from "@/lib/site";
import { useTranslation } from "@/components/LanguageProvider";

export function PricingSection() {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <section className="bg-[var(--surface)] px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black md:text-5xl">
            {t.pricing.sectionTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted)]">
            {t.pricing.sectionSubtitle}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {pricingPlans.map((plan) => {
            const planT =
              plan.id === "annual" ? t.pricing.plans.annual : t.pricing.plans.monthly;
            const activePlan = hoveredPlan ?? selectedPlan;
            const isHighlighted = plan.id === activePlan;
            return (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedPlan(plan.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedPlan(plan.id);
                  }
                }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative cursor-pointer rounded-2xl p-8 transition-all duration-200 border-2 bg-white outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                  isHighlighted
                    ? "border-black"
                    : "border-[var(--border)] hover:border-black/30"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-xs font-medium text-white">
                    {t.pricing.bestValue}
                  </span>
                )}
                <h3 className="text-lg font-semibold">{planT.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                  <span className="text-[var(--muted)]">/{planT.interval}</span>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{planT.description}</p>

                <ul className="mt-8 space-y-3">
                  {planT.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="mt-0.5 shrink-0 text-black" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/pricing?plan=${plan.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className={`mt-8 block rounded-full py-3 text-center text-sm font-medium transition-colors ${
                    isHighlighted
                      ? "bg-black text-white hover:bg-[#333]"
                      : "border border-[var(--border)] hover:bg-[var(--surface)]"
                  }`}
                >
                  {t.pricing.getStarted}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
