"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/lib/useTheme";

type TitleScreenProps = {
  onStart: () => void;
};

export function TitleScreen({ onStart }: TitleScreenProps) {
  const t = useTranslations("title");
  const tHud = useTranslations("hud");
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-4 select-none">
      {/* ── Theme toggle (top-right) ── */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="border-2 border-border bg-background px-2 sm:px-3 py-1.5 text-xs tracking-wider hover:border-border-active transition-colors"
        >
          <span
            className={
              theme === "dark" ? "text-accent-gold" : "text-text-muted"
            }
          >
            {tHud("dark")}
          </span>
          <span className="text-text-dim mx-1">/</span>
          <span
            className={
              theme === "light" ? "text-accent-gold" : "text-text-muted"
            }
          >
            {tHud("light")}
          </span>
        </button>
      </div>

      {/* ── Game Title ── */}
      <div className="text-center">
        <h1 className="text-accent-gold text-xl sm:text-3xl md:text-4xl leading-loose tracking-wider">
          {t("gameName")}
        </h1>
        <p className="text-text-muted text-xs sm:text-sm mt-4 tracking-widest">
          ─── {t("subtitle")} ───
        </p>
      </div>

      {/* ── Save Slot ── */}
      <div className="border-2 border-border-active bg-surface w-full max-w-sm sm:max-w-md p-5 sm:p-6">
        {/* Slot header */}
        <div className="flex items-center gap-2 border-b-2 border-border pb-3 mb-4">
          <span className="text-accent-gold text-sm">▶</span>
          <span className="text-accent-gold text-sm tracking-wide">
            {t("saveSlot")} 1
          </span>
        </div>

        {/* Name + level row */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-accent-green text-sm sm:text-base">
            {t("level")}
          </span>
          <span className="text-text-primary text-sm sm:text-base">
            {t("gameName")}
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-3 text-xs sm:text-sm">
          <p className="text-text-muted">{t("role")}</p>
          <div className="flex justify-between text-text-muted">
            <span>{t("location")}</span>
            <span>{t("yearsExp")}</span>
          </div>
          <p className="text-accent-gold">★ {t("downloads")}</p>
        </div>
      </div>

      {/* ── Press Start ── */}
      <button
        type="button"
        onClick={onStart}
        className="text-text-primary text-sm sm:text-base animate-blink tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
      >
        {t("pressStart")}
      </button>
    </div>
  );
}
