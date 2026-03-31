"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function HudBar() {
  const t = useTranslations("hud");
  const locale = useLocale();
  const router = useRouter();

  const toggleLocale = () => {
    const next = locale === "en" ? "es" : "en";
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b-2 border-border bg-surface px-3 sm:px-5 py-3">
      {/* Name + role */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <span className="text-accent-gold text-[8px] sm:text-[10px] tracking-wide shrink-0">
          ▶ {t("name")}
        </span>
        <span className="text-text-dim text-[8px] hidden sm:inline">│</span>
        <span className="text-text-muted text-[7px] sm:text-[9px] truncate">
          {t("level")}
        </span>
      </div>

      {/* Language toggle */}
      <button
        onClick={toggleLocale}
        className="shrink-0 border-2 border-border bg-background px-2 sm:px-3 py-1.5 text-[7px] sm:text-[9px] tracking-wider hover:border-border-active transition-colors"
      >
        <span className={locale === "en" ? "text-accent-gold" : "text-text-muted"}>
          EN
        </span>
        <span className="text-text-dim mx-1">/</span>
        <span className={locale === "es" ? "text-accent-gold" : "text-text-muted"}>
          ES
        </span>
      </button>
    </header>
  );
}
