"use client";

import { useTranslations } from "next-intl";

const CHAR_INFO = [
  { labelKey: "name", valueKey: "nameValue" },
  { labelKey: "class", valueKey: "classValue" },
  { labelKey: "guild", valueKey: "guildValue" },
  { labelKey: "location", valueKey: "locationValue" },
] as const;

const STAT_BOXES = [
  { labelKey: "yearsExp", valueKey: "yearsExpValue" },
  { labelKey: "appDownloads", valueKey: "appDownloadsValue" },
  { labelKey: "teamSizeLed", valueKey: "teamSizeLedValue" },
  { labelKey: "tasksDelivered", valueKey: "tasksDeliveredValue" },
] as const;

const LINKS = [
  { labelKey: "github", href: "https://github.com/Jezzail" },
  { labelKey: "linkedin", href: "https://linkedin.com/in/pabloabril/" },
  { labelKey: "email", href: "mailto:pat43607@gmail.com" },
] as const;

export function StatsSection() {
  const t = useTranslations("stats");

  return (
    <section className="border-2 border-border bg-surface p-6 sm:p-8 space-y-8">
      {/* Section title */}
      <h2 className="text-accent-gold text-sm sm:text-base tracking-wide">
        ─ {t("title")} ─
      </h2>

      {/* Character info block */}
      <div className="border-2 border-border p-4 sm:p-6 space-y-3">
        {CHAR_INFO.map(({ labelKey, valueKey }) => (
          <div
            key={labelKey}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3"
          >
            <span className="text-accent-gold text-xs sm:text-sm min-w-30 sm:min-w-35">
              {t(labelKey)}
            </span>
            <span className="text-text-primary text-xs sm:text-sm">
              {t(valueKey)}
            </span>
          </div>
        ))}
        {/* Status line with green dot */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
          <span className="text-accent-gold text-xs sm:text-sm min-w-30 sm:min-w-35">
            {t("status")}
          </span>
          <span className="text-accent-green text-xs sm:text-sm">
            <span aria-hidden="true">● </span>
            {t("statusValue")}
          </span>
        </div>
      </div>

      {/* Stat boxes — 2x2 grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {STAT_BOXES.map(({ labelKey, valueKey }) => (
          <div
            key={labelKey}
            className="border-2 border-border p-3 sm:p-4 flex flex-col items-center text-center"
          >
            <span className="text-accent-gold text-xs tracking-wide mb-2">
              {t(labelKey)}
            </span>
            <span className="text-accent-green text-base sm:text-lg">
              {t(valueKey)}
            </span>
          </div>
        ))}
      </div>

      {/* Bio */}
      <div>
        <h3 className="text-accent-gold text-xs sm:text-sm tracking-wide mb-3">
          ─ {t("bio")} ─
        </h3>
        <p className="text-text-muted text-xs leading-relaxed sm:leading-loose">
          {t("bioText")}
        </p>
      </div>

      {/* Contact links */}
      <div>
        <h3 className="text-accent-gold text-xs sm:text-sm tracking-wide mb-3">
          ─ {t("contact")} ─
        </h3>
        <ul className="space-y-2">
          {LINKS.map(({ labelKey, href }) => {
            const isHttpLink =
              href.startsWith("http://") || href.startsWith("https://");

            return (
              <li key={labelKey}>
                <a
                  href={href}
                  target={isHttpLink ? "_blank" : undefined}
                  rel={isHttpLink ? "noopener noreferrer" : undefined}
                  className="text-text-primary text-xs sm:text-sm hover:text-accent-gold transition-colors"
                >
                  <span aria-hidden="true">▶ </span>
                  {t(labelKey)}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
