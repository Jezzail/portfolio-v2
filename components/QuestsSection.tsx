"use client";

import { useState, useMemo, memo } from "react";
import { useTranslations } from "next-intl";
import { quests } from "@/data/quests";
import type { QuestFilter, QuestStatus } from "@/types";

const FILTERS: QuestFilter[] = ["all", "current", "completed"];

const FILTER_I18N: Record<QuestFilter, string> = {
  all: "filterAll",
  current: "filterActive",
  completed: "filterCompleted",
};

const STATUS_I18N: Record<QuestStatus, string> = {
  current: "statusActive",
  completed: "statusCompleted",
};

function statusColorClass(status: QuestStatus): string {
  return status === "current" ? "text-accent-green" : "text-text-muted";
}

function questDuration(start: string, end?: string): string {
  const [sy, sm] = start.split(".").map(Number);
  const now = new Date();
  const [ey, em] = end
    ? end.split(".").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const totalMonths = (ey - sy) * 12 + (em - sm);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}

export const QuestsSection = memo(function QuestsSection() {
  const t = useTranslations("quests");
  const [filter, setFilter] = useState<QuestFilter>("all");

  const filtered = useMemo(
    () =>
      filter === "all" ? quests : quests.filter((q) => q.status === filter),
    [filter],
  );

  return (
    <section className="border-2 border-border bg-surface p-4 sm:p-8 space-y-4 sm:space-y-8">
      {/* Section title */}
      <h2 className="text-accent-gold text-sm sm:text-base tracking-wide">
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
            className={`border-2 px-3 py-2 text-2xs sm:text-xs tracking-wide transition-colors ${
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
          <div
            key={quest.id}
            className="border-2 border-border p-4 sm:p-5 space-y-3"
          >
            {/* Company + status badge */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-accent-gold text-xs sm:text-sm tracking-wide">
                {quest.company}
              </h3>
              <span
                className={`px-2 py-1 text-2xs sm:text-xs tracking-wide ${statusColorClass(quest.status)}`}
              >
                {t(STATUS_I18N[quest.status])}
              </span>
            </div>

            {/* Role */}
            <p className="text-text-primary text-xs sm:text-sm">
              {t(quest.role)}
            </p>

            {/* Period · Duration · Location */}
            <p className="text-text-muted text-xs">
              {quest.start} – {quest.end ?? t("present")}
              {quest.end
                ? ` · ${questDuration(quest.start, quest.end)}`
                : ""} · {quest.location}
            </p>

            {/* Objectives */}
            <ul className="space-y-1">
              {quest.objectives.map((obj) => (
                <li key={obj} className="text-text-primary text-xs">
                  {"\u25B6\uFE0E"} {t(obj)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
});
