"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/components/LanguageProvider";

interface HeaderProps {
  user?: { name: string; isSubscribed: boolean } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 glass border-b border-[var(--border)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/willsview-icon-logo.svg"
              alt="Will'sView"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0"
            />
            <span className="text-xl font-semibold tracking-tight text-black">
              Will&apos;s<span className="text-[var(--muted)]">View</span>
            </span>
          </Link>

        <div className="hidden items-center gap-8 md:flex">
          <LanguageSelector />
          <Link
            href="/articles"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            {t.nav.articles}
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            {t.nav.pricing}
          </Link>
          {user?.isSubscribed ? (
            <Link
              href="/members"
              className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            >
              {t.nav.members}
            </Link>
          ) : null}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--muted)]">{user.name}</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  {t.nav.signOut}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333]"
            >
              {t.nav.signIn}
            </Link>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t.nav.toggleMenu}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-[var(--border)] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link href="/articles" onClick={() => setMobileOpen(false)}>
                {t.nav.articles}
              </Link>
            </div>
            <Link href="/pricing" onClick={() => setMobileOpen(false)}>
              {t.nav.pricing}
            </Link>
            {user?.isSubscribed && (
              <Link href="/members" onClick={() => setMobileOpen(false)}>
                {t.nav.members}
              </Link>
            )}
            {user ? (
              <form action="/api/auth/logout" method="POST">
                <button type="submit">{t.nav.signOut}</button>
              </form>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-black px-5 py-2 text-center text-sm font-medium text-white"
                onClick={() => setMobileOpen(false)}
              >
                {t.nav.signIn}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
