"use client";

import { useTranslations } from "next-intl";

export function QuestsSection() {
  const t = useTranslations("quests");

  return (
    <section className="border-2 border-border bg-surface p-6 sm:p-8">
      <h2 className="text-accent-gold text-[10px] sm:text-xs tracking-wide mb-6">
        ─ {t("title")} ─
      </h2>
      <p className="text-text-muted text-[8px] sm:text-[10px]">
        ▸ LOADING QUEST LOG...
      </p>
    </section>
  );
}
