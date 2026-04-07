"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { items, magazineIssues } from "@/data/items";
import { MagazineReader } from "@/components/MagazineReader";
import type { ItemRarity } from "@/types";

function assertNever(x: never): never {
  throw new Error(`Unhandled ItemRarity: ${x as string}`);
}

const RARITY_I18N: Record<ItemRarity, string> = {
  legendary: "rarityLegendary",
  rare: "rarityRare",
  uncommon: "rarityUncommon",
  locked: "rarityLocked",
};

function rarityColorClass(rarity: ItemRarity): string {
  switch (rarity) {
    case "legendary":
      return "border-accent-gold text-accent-gold";
    case "rare":
      return "border-accent-blue text-accent-blue";
    case "uncommon":
      return "border-accent-green text-accent-green";
    case "locked":
      return "border-text-dim text-text-dim";
    default:
      return assertNever(rarity);
  }
}

function nameColorClass(rarity: ItemRarity): string {
  return rarity === "locked" ? "text-text-dim" : "text-accent-gold";
}

export function ItemsSection() {
  const t = useTranslations("items");
  const tMag = useTranslations("items.magazine");
  const [readerOpen, setReaderOpen] = useState(false);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);

  return (
    <section className="border-2 border-border bg-surface p-6 sm:p-8 space-y-6">
      {/* Section title */}
      <h2 className="text-accent-gold text-[10px] sm:text-xs tracking-wide">
        ─ {t("title")} ─
      </h2>

      {/* Item cards */}
      <div className="space-y-4">
        {items.map((item) => {
          const isLocked = item.rarity === "locked";

          return (
            <div
              key={item.id}
              className={`border-2 p-4 sm:p-5 space-y-3 ${
                isLocked
                  ? "border-text-dim opacity-50"
                  : "border-border"
              }`}
            >
              {/* Name + rarity badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3
                  className={`text-[9px] sm:text-[10px] tracking-wide ${nameColorClass(item.rarity)}`}
                >
                  {t(item.name)}
                </h3>
                <span
                  className={`border-2 px-2 py-1 text-[6px] sm:text-[7px] tracking-wide ${rarityColorClass(item.rarity)}`}
                >
                  {t(RARITY_I18N[item.rarity])}
                </span>
              </div>

              {/* Description */}
              <p
                className={`text-[7px] sm:text-[8px] leading-relaxed ${
                  isLocked ? "text-text-dim" : "text-text-primary"
                }`}
              >
                {t(item.description)}
              </p>

              {/* Tech tags */}
              {item.tech.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tech.map((tag) => (
                    <span
                      key={tag}
                      className="border-2 border-border px-2 py-1 text-[6px] sm:text-[7px] text-text-muted tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Magazine issue selector (replaces VIEW button) */}
              {item.hasMagazineReader && (
                <div className="flex flex-wrap gap-2">
                  {magazineIssues.map((iss, idx) => (
                    <button
                      key={iss.issue}
                      type="button"
                      onClick={() => {
                        setSelectedIssueIndex(idx);
                        setReaderOpen(true);
                      }}
                      className="border-2 border-border px-3 py-2 text-[7px] sm:text-[8px] text-text-muted tracking-wide hover:border-border-active hover:text-accent-gold transition-colors"
                    >
                      {tMag(iss.labelKey.replace("items.magazine.", ""))}
                    </button>
                  ))}
                </div>
              )}

              {/* Link button + note */}
              {item.link && !item.hasMagazineReader && (
                <div className="space-y-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border-2 border-border px-3 py-2 text-[7px] sm:text-[8px] text-accent-gold tracking-wide hover:border-border-active transition-colors"
                  >
                    <span aria-hidden="true">▶ </span>{t("viewProject")}
                  </a>
                  {item.linkNote && (
                    <p className="text-text-muted text-[6px] sm:text-[7px]">
                      {t(item.linkNote)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Magazine reader modal */}
      {readerOpen && (
        <MagazineReader
          issues={magazineIssues}
          initialIssueIndex={selectedIssueIndex}
          onClose={() => setReaderOpen(false)}
        />
      )}
    </section>
  );
}
