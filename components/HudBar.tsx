"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

export function HudBar() {
  const t = useTranslations("hud");

  return (
    <header className="border-l-2 border-r-2 border-border bg-surface">
      <div className="mx-auto max-w-215 flex items-center justify-between px-3 sm:px-5 py-3">
        {/* Name + level/role — two-line block */}
        <div className="min-w-0">
          <p className="text-accent-gold text-base font-bold tracking-wide">
            {t("name")}
          </p>
          <p className="text-accent-green text-xs tracking-wide mt-1">
            {t("lvl")} · {t("role")}
          </p>
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
