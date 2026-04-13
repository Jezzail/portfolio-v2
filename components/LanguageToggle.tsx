"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const next = locale === "en" ? "es" : "en";
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  };

  return (
    <button
      onClick={toggleLocale}
      className="shrink-0 border-2 border-border bg-background px-2 sm:px-3 py-1.5 text-xs tracking-wider text-accent-gold hover:border-border-active transition-colors"
    >
      {locale === "en" ? "EN" : "ES"}
    </button>
  );
}
