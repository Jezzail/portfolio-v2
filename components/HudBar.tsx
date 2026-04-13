"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

export function HudBar() {
  const t = useTranslations("hud");

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
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
