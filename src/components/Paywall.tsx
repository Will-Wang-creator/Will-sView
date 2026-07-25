"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

interface PaywallProps {
  isLoggedIn?: boolean;
}

export function Paywall({ isLoggedIn = false }: PaywallProps) {
  const { t } = useTranslation();

  return (
    <div className="relative mt-8">
      <div className="pointer-events-none max-h-48 overflow-hidden">
        <div className="prose-content blur-sm">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident.
          </p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[var(--background)] via-[var(--background)]/90 to-transparent pb-8">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-[var(--surface)] p-3">
            <Lock size={24} className="text-black" />
          </div>
          <h3 className="text-xl font-semibold text-black">{t.paywall.title}</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">{t.paywall.description}</p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#333]"
          >
            {t.paywall.subscribe}
          </Link>
          {!isLoggedIn && (
            <p className="mt-3 text-xs text-[var(--muted)]">
              {t.paywall.alreadyMember}{" "}
              <Link href="/login" className="text-black underline hover:no-underline">
                {t.paywall.signIn}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
