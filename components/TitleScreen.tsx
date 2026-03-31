"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

type TitleScreenProps = {
  onStart: () => void;
};

export function TitleScreen({ onStart }: TitleScreenProps) {
  const t = useTranslations("title");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") onStart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStart]);

  return (
    <div
      onClick={onStart}
      className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 select-none"
    >
      {/* ── Game Title ── */}
      <div className="text-center">
        <h1 className="text-accent-gold text-xl sm:text-3xl md:text-4xl leading-loose tracking-wider">
          {t("gameName")}
        </h1>
        <p className="text-text-muted text-[8px] sm:text-[10px] mt-4 tracking-widest">
          ─── {t("subtitle")} ───
        </p>
      </div>

      {/* ── Save Slot ── */}
      <div className="border-2 border-border-active bg-surface w-full max-w-sm sm:max-w-md p-5 sm:p-6">
        {/* Slot header */}
        <div className="flex items-center gap-2 border-b-2 border-border pb-3 mb-4">
          <span className="text-accent-gold text-[10px]">▶</span>
          <span className="text-accent-gold text-[10px] tracking-wide">
            {t("saveSlot")} 1
          </span>
        </div>

        {/* Name + level row */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-accent-green text-[10px] sm:text-xs">
            {t("level")}
          </span>
          <span className="text-text-primary text-[10px] sm:text-xs">
            {t("gameName")}
          </span>
        </div>

        {/* Stats */}
        <div className="space-y-3 text-[8px] sm:text-[10px]">
          <p className="text-text-muted">{t("role")}</p>
          <div className="flex justify-between text-text-muted">
            <span>{t("location")}</span>
            <span>{t("yearsExp")}</span>
          </div>
          <p className="text-accent-gold">★ {t("downloads")}</p>
        </div>
      </div>

      {/* ── Press Start ── */}
      <p className="text-text-primary text-[10px] sm:text-xs animate-blink tracking-widest">
        {t("pressStart")}
      </p>
    </div>
  );
}
