"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("hud");

  return (
    <button
      onClick={toggleTheme}
      aria-label={t("toggleTheme")}
      className="shrink-0 border-2 border-border bg-background px-2 sm:px-3 py-1.5 text-xs tracking-wider hover:border-border-active transition-colors"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
