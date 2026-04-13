"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import type { KeyboardEvent } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

type TitleScreenProps = {
  onStart: () => void;
};

export function TitleScreen({ onStart }: TitleScreenProps) {
  const t = useTranslations("title");

  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [onStart]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onStart();
    }
  };

  return (
    <div className="relative flex h-dvh flex-col items-center justify-center gap-4 sm:gap-8 px-4 sm:px-6 py-6 sm:py-10 select-none overflow-hidden">
      {/* ── Toggles (top-right) ── */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 max-w-215 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <ThemeToggle />
        <LanguageToggle />
      </div>

      {/* ── Game Title ── */}
      <div className="text-center">
        <h1 className="text-accent-gold text-2xl sm:text-4xl leading-loose tracking-wider [text-shadow:3px_3px_0px_#b8860b,_6px_6px_0px_#3a2a00]">
          {t("gameName")}
        </h1>
        <p className="text-text-muted text-xs sm:text-sm mt-2 sm:mt-4 tracking-widest">
          ─── {t("subtitle")} ───
        </p>
      </div>

      {/* ── Save slots + press start ── */}
      <div className="flex flex-col items-center gap-4 sm:gap-8 w-full">
        {/* ── Save Slots Container ── */}
        <div className="w-full max-w-215 flex flex-col gap-3">
          {/* ── Save Slot 1 (active) ── */}
          <div
            role="button"
            tabIndex={0}
            onClick={onStart}
            onKeyDown={handleKeyDown}
            className="border-2 bg-surface hover:bg-border p-4 sm:p-5 border-border-active transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
          >
            <div className="flex items-center gap-3">
              {/* Avatar with arrow via ::before */}
              <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 border-2 border-text-dim flex items-center justify-center p-0.5 before:content-['▶'] before:absolute before:-left-4 before:text-accent-gold before:text-xs before:opacity-100 before:transition-opacity">
                <Image
                  src="/avatar/pat_neutral.png"
                  alt=""
                  width={40}
                  height={40}
                  data-pixel=""
                  className="w-full h-full scale-x-[-1]"
                />
              </div>

              {/* Slot info */}
              <div className="flex-1 min-w-0">
                {/* Save file label */}
                <span className="text-text-primary text-xs sm:text-sm truncate block">
                  {t("saveFileLabel")}
                </span>

                {/* Tags — stacked vertically */}
                <div className="flex flex-col gap-1 mt-2 text-2xs sm:text-xs">
                  <span>
                    <span className="text-text-muted">{t("classLabel")}</span>{" "}
                    <span className="text-accent-green">{t("classValue")}</span>
                  </span>
                  <span>
                    <span className="text-text-muted">
                      {t("locationLabel")}
                    </span>{" "}
                    <span className="text-accent-green">
                      {t("locationValue")}
                    </span>
                  </span>
                  <span>
                    <span className="text-text-muted">{t("expLabel")}</span>{" "}
                    <span className="text-accent-green">{t("expValue")}</span>
                  </span>
                </div>
              </div>

              {/* Active badge — right-aligned, vertically centered */}
              <span className="text-text-muted text-sm shrink-0 self-center hidden sm:inline-block">
                {t("active")}
              </span>
            </div>
          </div>

          {/* ── Empty Slot ── */}
          <div className="border-2 border-border bg-surface p-4 sm:p-5 hover:border-text-dim transition-colors">
            <div className="flex items-center gap-3">
              {/* Placeholder avatar */}
              <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 border-2 border-border flex items-center justify-center">
                <span className="text-text-dim text-xl">?</span>
              </div>

              {/* Empty label */}
              <div className="flex-1 min-w-0">
                <p className="text-text-dim text-xs sm:text-sm">
                  {t("emptySlot")}
                </p>
                <p className="text-text-dim text-2xs mt-1">{t("noData")}</p>
              </div>

              {/* Disabled status */}
              <span className="text-text-dim text-xs shrink-0 self-center">
                {t("emptyStatus")}
              </span>
            </div>
          </div>
        </div>

        {/* ── Press Start ── */}
        <button
          onClick={onStart}
          className="text-accent-gold text-sm sm:text-base animate-blink tracking-widest px-10 py-4 bg-transparent border-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
        >
          <span className="inline-flex items-center gap-3">
            <span>▶</span>
            <span className="translate-y-0.75">{t("pressStart")}</span>
            <span>◀</span>
          </span>
        </button>
      </div>

      {/* ── Copyright ── */}
      <p className="absolute bottom-4 left-4 right-4 text-text-dim text-2xs sm:text-xs tracking-wide text-center">
        {t("copyright")}
      </p>
    </div>
  );
}
