import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'}document.documentElement.dataset.theme=t}catch(e){}})()`;

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pablo Abril — Senior Frontend Engineer",
  description:
    "Portfolio of Pablo Abril, Senior Frontend / React Native Engineer based in Seoul. 10+ years of experience building web and mobile apps.",
  openGraph: {
    title: "Pablo Abril — Senior Frontend Engineer",
    description:
      "Portfolio of Pablo Abril, Senior Frontend / React Native Engineer based in Seoul. 10+ years of experience building web and mobile apps.",
    url: "https://patportfolio.dev",
    siteName: "Pablo Abril Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pablo Abril — Senior Frontend Engineer",
    description:
      "Portfolio of Pablo Abril, Senior Frontend / React Native Engineer based in Seoul.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("hud");

  return (
    <html
      lang={locale}
      className={`${pressStart2P.className} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_INIT_SCRIPT,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:border-2 focus:border-border-active focus:bg-background focus:px-3 focus:py-2 focus:text-xs focus:text-accent-gold"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
