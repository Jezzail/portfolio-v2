"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { skills } from "@/data/skills";
import type { SkillCategory, SkillLevel } from "@/types";

const CATEGORY_ORDER: SkillCategory[] = [
  "mobile_frontend",
  "product",
  "leadership",
];
const MAX_SKILL_LEVEL = 10;

const FILTERS = ["all", ...CATEGORY_ORDER] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_I18N: Record<Filter, string> = {
  all: "filterAll",
  mobile_frontend: "filterMobileFrontend",
  product: "filterProduct",
  leadership: "filterLeadership",
};

const CATEGORY_I18N: Record<SkillCategory, string> = {
  mobile_frontend: "categoryMobileFrontend",
  product: "categoryProduct",
  leadership: "categoryLeadership",
};

function barColorClass(level: SkillLevel): string {
  if (level >= 8) return "bg-accent-gold";
  if (level >= 5) return "bg-accent-green";
  return "bg-text-muted";
}

export function SkillsSection() {
  const t = useTranslations("skills");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all" ? skills : skills.filter((s) => s.category === filter);

  const grouped =
    filter === "all"
      ? CATEGORY_ORDER.filter((cat) =>
          filtered.some((s) => s.category === cat),
        ).map((cat) => ({
          category: cat,
          items: filtered.filter((s) => s.category === cat),
        }))
      : CATEGORY_ORDER.filter((cat) => cat === filter).map((cat) => ({
          category: cat,
          items: filtered,
        }));

  return (
    <section className="border-2 border-border bg-surface p-4 sm:p-8 space-y-4 sm:space-y-8">
      {/* Section title */}
      <h2 className="text-accent-gold text-sm sm:text-base tracking-wide">
        ─ {t("title")} ─
      </h2>

      {/* Filter tabs */}
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t("filterLabel")}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
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

      {/* Skill list */}
      <div className="space-y-6">
        {grouped.map(({ category, items }) => (
          <div key={category} className="space-y-3">
            {/* Category header — only shown in ALL view */}
            {filter === "all" && (
              <h3 className="text-text-muted text-xs sm:text-sm tracking-wide">
                {"\u25B6\uFE0E"} {t(CATEGORY_I18N[category])}
              </h3>
            )}

            {/* Skill rows */}
            <div className="space-y-2">
              {items.map((skill) => (
                <div
                  key={skill.name}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
                >
                  {/* Skill name */}
                  <span className="text-text-primary text-xs w-full sm:w-35 shrink-0">
                    {skill.name}
                  </span>

                  {/* XP bar + level */}
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 border-2 border-border h-4 sm:h-5 relative overflow-hidden">
                      <div
                        className={`h-full ${barColorClass(skill.level)}`}
                        style={{
                          width: `${Math.max(0, Math.min(skill.level, MAX_SKILL_LEVEL)) * (100 / MAX_SKILL_LEVEL)}%`,
                        }}
                      />
                    </div>

                    {/* Level label */}
                    <span className="text-accent-gold text-xs min-w-12 sm:min-w-16 text-right shrink-0">
                      {t("lvl")} {skill.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
