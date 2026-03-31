import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

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

  return (
    <html lang={locale} className={`${pressStart2P.className} h-full`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
