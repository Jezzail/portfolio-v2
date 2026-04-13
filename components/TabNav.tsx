"use client";

import { useTranslations } from "next-intl";
import type { PortfolioTab } from "@/types";

const TABS: PortfolioTab[] = ["stats", "skills", "quests", "items"];

type TabNavProps = {
  activeTab: PortfolioTab;
  onTabChange: (tab: PortfolioTab) => void;
};

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const t = useTranslations("nav");

  return (
    <nav className="flex border-b-2 border-l-2 border-r-2 border-border bg-surface">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`relative px-2 sm:px-4 py-3 text-xs tracking-wide border-r-2 border-border transition-colors ${
            activeTab === tab
              ? "text-accent-gold bg-background -mb-0.5 border-b-2 border-b-accent-gold z-10"
              : "text-text-muted hover:text-text-primary hover:bg-background/50"
          }`}
        >
          {t(tab)}
        </button>
      ))}
    </nav>
  );
}
