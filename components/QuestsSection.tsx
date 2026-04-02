"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { quests } from "@/data/quests";
import type { QuestFilter, QuestStatus } from "@/types";

const FILTERS: QuestFilter[] = ["all", "current", "completed"];

const FILTER_I18N: Record<QuestFilter, string> = {
  all: "filterAll",
  current: "filterCurrent",
  completed: "filterCompleted",
};

const STATUS_I18N: Record<QuestStatus, string> = {
  current: "statusCurrent",
  completed: "statusCompleted",
};

function statusColorClass(status: QuestStatus): string {
  return status === "current"
    ? "border-accent-green text-accent-green"
    : "border-text-muted text-text-muted";
}

export function QuestsSection() {
  const t = useTranslations("quests");
  const [filter, setFilter] = useState<QuestFilter>("all");

  const filtered =
    filter === "all" ? quests : quests.filter((q) => q.status === filter);

  return (
    <section className="border-2 border-border bg-surface p-6 sm:p-8 space-y-6">
      {/* Section title */}
      <h2 className="text-accent-gold text-[10px] sm:text-xs tracking-wide">
        ─ {t("title")} ─
      </h2>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-2" aria-label={t("filterLabel")}>
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`border-2 px-3 py-2 text-[7px] sm:text-[8px] tracking-wide transition-colors ${
              filter === f
                ? "border-border-active text-accent-gold"
                : "border-border text-text-muted hover:text-text-primary"
            }`}
          >
            {t(FILTER_I18N[f])}
          </button>
        ))}
      </div>

      {/* Quest cards */}
      <div className="space-y-4">
        {filtered.map((quest) => (
          <div key={quest.id} className="border-2 border-border p-4 sm:p-5 space-y-3">
            {/* Company + status badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-accent-gold text-[9px] sm:text-[10px] tracking-wide">
                {quest.company}
              </h3>
              <span
                className={`border-2 px-2 py-1 text-[6px] sm:text-[7px] tracking-wide ${statusColorClass(quest.status)}`}
              >
                {t(STATUS_I18N[quest.status])}
              </span>
            </div>

            {/* Role */}
            <p className="text-text-primary text-[8px] sm:text-[9px]">
              {t(quest.role)}
            </p>

            {/* Period · Location */}
            <p className="text-text-muted text-[7px] sm:text-[8px]">
              {quest.start} – {quest.end ?? t("present")} · {quest.location}
            </p>

            {/* Objectives */}
            <ul className="space-y-1">
              {quest.objectives.map((obj) => (
                <li key={obj} className="text-text-primary text-[7px] sm:text-[8px]">
                  ▶ {t(obj)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
