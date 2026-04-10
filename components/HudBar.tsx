"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/useTheme";

export function HudBar() {
  const t = useTranslations("hud");
  const locale = useLocale();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const toggleLocale = () => {
    const next = locale === "en" ? "es" : "en";
    document.cookie = `locale=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  };

  return (
    <header className="border-b-2 border-border bg-surface">
      <div className="mx-auto max-w-215 flex items-center justify-between px-3 sm:px-5 py-3">
        {/* Name + role */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-accent-gold text-xs sm:text-sm tracking-wide shrink-0">
            ▶ {t("name")}
          </span>
          <span className="text-text-dim text-xs hidden sm:inline">│</span>
          <span className="text-text-muted text-xs truncate">{t("level")}</span>
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="shrink-0 border-2 border-border bg-background px-2 sm:px-3 py-1.5 text-xs tracking-wider hover:border-border-active transition-colors"
          >
            <span
              className={
                theme === "dark" ? "text-accent-gold" : "text-text-muted"
              }
            >
              {t("dark")}
            </span>
            <span className="text-text-dim mx-1">/</span>
            <span
              className={
                theme === "light" ? "text-accent-gold" : "text-text-muted"
              }
            >
              {t("light")}
            </span>
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="shrink-0 border-2 border-border bg-background px-2 sm:px-3 py-1.5 text-xs tracking-wider hover:border-border-active transition-colors"
          >
            <span
              className={
                locale === "en" ? "text-accent-gold" : "text-text-muted"
              }
            >
              EN
            </span>
            <span className="text-text-dim mx-1">/</span>
            <span
              className={
                locale === "es" ? "text-accent-gold" : "text-text-muted"
              }
            >
              ES
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
