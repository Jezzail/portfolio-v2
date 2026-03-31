"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { skills } from "@/data/skills";
import type { SkillCategory } from "@/types";

const FILTERS = ["all", "frontend", "mobile", "tooling", "leadership"] as const;
type Filter = (typeof FILTERS)[number];

const CATEGORY_ORDER: SkillCategory[] = ["frontend", "mobile", "tooling", "leadership"];

const FILTER_I18N: Record<Filter, string> = {
  all: "filterAll",
  frontend: "filterFrontend",
  mobile: "filterMobile",
  tooling: "filterTooling",
  leadership: "filterLeadership",
};

const CATEGORY_I18N: Record<SkillCategory, string> = {
  frontend: "categoryFrontend",
  mobile: "categoryMobile",
  tooling: "categoryTooling",
  leadership: "categoryLeadership",
};

function barColorClass(level: number): string {
  if (level >= 8) return "bg-accent-gold";
  if (level >= 5) return "bg-accent-green";
  return "bg-text-muted";
}

export function SkillsSection() {
  const t = useTranslations("skills");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all" ? skills : skills.filter((s) => s.category === filter);

  // Group by category for "all" view
  const grouped = filter === "all"
    ? CATEGORY_ORDER.filter((cat) => filtered.some((s) => s.category === cat)).map(
        (cat) => ({
          category: cat,
          items: filtered.filter((s) => s.category === cat),
        }),
      )
    : [{ category: filter as SkillCategory, items: filtered }];

  return (
    <section className="border-2 border-border bg-surface p-6 sm:p-8 space-y-6">
      {/* Section title */}
      <h2 className="text-accent-gold text-[10px] sm:text-xs tracking-wide">
        ─ {t("title")} ─
      </h2>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
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

      {/* Skill list */}
      <div className="space-y-6">
        {grouped.map(({ category, items }) => (
          <div key={category} className="space-y-3">
            {/* Category header — only shown in ALL view */}
            {filter === "all" && (
              <h3 className="text-text-muted text-[8px] sm:text-[9px] tracking-wide">
                ▸ {t(CATEGORY_I18N[category])}
              </h3>
            )}

            {/* Skill rows */}
            <div className="space-y-2">
              {items.map((skill) => (
                <div key={skill.name} className="flex items-center gap-3">
                  {/* Skill name */}
                  <span className="text-text-primary text-[7px] sm:text-[8px] min-w-25 sm:min-w-45 shrink-0">
                    {skill.name}
                  </span>

                  {/* XP bar */}
                  <div className="flex-1 border-2 border-border h-4 sm:h-5 relative">
                    <div
                      className={`h-full ${barColorClass(skill.level)}`}
                      style={{ width: `${(skill.level / 10) * 100}%` }}
                    />
                  </div>

                  {/* Level label */}
                  <span className="text-accent-gold text-[7px] sm:text-[8px] min-w-12.5 sm:min-w-15 text-right shrink-0">
                    {t("lvl")} {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
