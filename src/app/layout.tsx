import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { localeHtmlLang } from "@/lib/i18n";
import { SITE_NAME } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Engineering Intelligence Platform`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "The #1 engineering intelligence platform. Big tech and startups, from the inside. In-depth articles on engineering culture, compensation, and best practices.",
  keywords: [
    "engineering",
    "software",
    "tech industry",
    "engineering culture",
    "compensation",
    "big tech",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  icons: {
    icon: "/willsview-icon-logo.svg",
    apple: "/willsview-icon-logo.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, locale] = await Promise.all([getSession(), getLocale()]);

  return (
    <html
      lang={localeHtmlLang[locale]}
      className={`${inter.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider initialLocale={locale}>
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
