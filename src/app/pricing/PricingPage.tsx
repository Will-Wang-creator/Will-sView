"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { pricingPlans } from "@/lib/data/pricing";
import { formatPrice } from "@/lib/site";
import { useTranslation } from "@/components/LanguageProvider";

export default function PricingPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const defaultPlan = searchParams.get("plan") || "annual";
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.newebpay) {
        const form = document.createElement("form");
        form.method = data.newebpay.method ?? "POST";
        form.action = data.newebpay.action;
        for (const [key, value] of Object.entries(data.newebpay.fields as Record<string, string>)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 401) {
        window.location.href = `/login?returnTo=/pricing?plan=${planId}`;
      } else {
        alert(data.error || t.pricing.checkoutFailed);
      }
    } catch {
      alert(t.pricing.checkoutFailed);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
          {t.pricing.pageTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--muted)]">
          {t.pricing.pageSubtitle}
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2">
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
                  {t.pricing.bestValueSave}
                </span>
              )}
              <h2 className="text-xl font-semibold">{planT.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-5xl font-bold">{formatPrice(plan.price)}</span>
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

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  void handleCheckout(plan.id);
                }}
                disabled={loading === plan.id}
                className={`mt-8 w-full rounded-full py-3.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  isHighlighted
                    ? "bg-black text-white hover:bg-[#333]"
                    : "border border-[var(--border)] hover:bg-[var(--surface)]"
                }`}
              >
                {loading === plan.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> {t.pricing.processing}
                  </span>
                ) : (
                  `${t.pricing.subscribe} — ${formatPrice(plan.price)}/${planT.interval}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl bg-[var(--surface)] p-8">
        <h3 className="text-lg font-semibold">{t.pricing.whatsIncluded}</h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {t.pricing.includedFeatures.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <Check size={16} className="shrink-0 text-black" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        {t.pricing.alreadyMember}{" "}
        <Link href="/login" className="text-black underline hover:no-underline">
          {t.nav.signIn}
        </Link>
      </p>
    </div>
  );
}
