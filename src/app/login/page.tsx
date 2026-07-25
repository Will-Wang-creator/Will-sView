"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/members";
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.login.somethingWrong);
        return;
      }

      router.push(returnTo.startsWith("/") ? returnTo : "/members");
      router.refresh();
    } catch {
      setError(t.login.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-black">
        {isRegister ? t.login.createAccount : t.login.welcomeBack}
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        {isRegister ? t.login.signUpSubtitle : t.login.signInSubtitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {isRegister && (
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium">
              {t.login.name}
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
              placeholder={t.login.namePlaceholder}
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            {t.login.email}
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            placeholder={t.login.emailPlaceholder}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            {t.login.password}
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-black outline-none focus:border-black"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              {isRegister ? t.login.creatingAccount : t.login.signingIn}
            </span>
          ) : isRegister ? (
            t.login.createAccountBtn
          ) : (
            t.login.signIn
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        {isRegister ? t.login.alreadyHaveAccount : t.login.dontHaveAccount}{" "}
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="text-black underline hover:no-underline"
        >
          {isRegister ? t.login.signIn : t.login.createOne}
        </button>
      </p>

      <div className="mt-8 rounded-xl bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--foreground)]">{t.login.demoAccounts}</p>
        <p className="mt-1">
          {t.login.demoMember} <code className="text-xs">demo@example.com</code> /{" "}
          <code className="text-xs">demo1234</code>
        </p>
        <p>
          {t.login.demoFree} <code className="text-xs">free@example.com</code> /{" "}
          <code className="text-xs">demo1234</code>
        </p>
      </div>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        {t.login.notMember}{" "}
        <Link href="/pricing" className="text-black underline hover:no-underline">
          {t.login.viewPricing}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
