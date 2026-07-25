"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { locales } from "@/lib/i18n";
import { useLanguage } from "@/components/LanguageProvider";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.code === locale) ?? locales[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        aria-label={t.language.label}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe size={16} className="shrink-0" />
        <span className="hidden sm:inline">{current.nativeLabel}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.language.label}
          className="absolute left-0 top-full z-50 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--border)] bg-white py-1 shadow-lg"
        >
          {locales.map((item) => (
            <li key={item.code} role="option" aria-selected={item.code === locale}>
              <button
                type="button"
                onClick={() => {
                  setLocale(item.code);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--surface)] ${
                  item.code === locale
                    ? "font-medium text-black"
                    : "text-[var(--muted)]"
                }`}
              >
                {item.nativeLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
