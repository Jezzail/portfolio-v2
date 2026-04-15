"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { PortfolioTab } from "@/types";
import { HudBar } from "@/components/HudBar";
import { TabNav } from "@/components/TabNav";
import { StatsSection } from "@/components/StatsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { QuestsSection } from "@/components/QuestsSection";
import { ItemsSection } from "@/components/ItemsSection";

type PortfolioScreenProps = {
  onOpenChat: () => void;
  onBack: () => void;
};

export function PortfolioScreen({ onOpenChat, onBack }: PortfolioScreenProps) {
  const [activeTab, setActiveTab] = useState<PortfolioTab>("stats");
  const t = useTranslations("nav");
  const tPortfolio = useTranslations("portfolio");

  const handleTabChange = (tab: PortfolioTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col">
      {/* Sticky header group: HudBar (full width) + TabNav (max-w) */}
      <div className="sticky top-0 z-40">
        <div className="mx-auto max-w-215">
          <HudBar />

          {/* Ask Pablo navigator */}
          <button
            onClick={onOpenChat}
            className="flex w-full items-center gap-3 border-2 border-border bg-surface px-3 sm:px-5 py-3 text-left hover:border-border-active transition-colors"
          >
            💬
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="text-xs text-accent-green">
                [ {t("askPablo")} ]
              </span>
              <span className="text-2xs text-text-muted">
                {t("askPabloDesc")}
              </span>
            </div>
            <span className="shrink-0 text-2xs sm:text-xs text-accent-gold">
              {"\u25B6\uFE0E"} {t("open")}
            </span>
          </button>

          <TabNav activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-215 w-full">
        <main className="p-4 sm:p-6">
          <AnimatePresence
            mode="wait"
            onExitComplete={() => window.scrollTo({ top: 0 })}
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "stats" && <StatsSection />}
              {activeTab === "skills" && <SkillsSection />}
              {activeTab === "quests" && <QuestsSection />}
              {activeTab === "items" && <ItemsSection />}
            </motion.div>
          </AnimatePresence>

          {/* Back to title */}
          <button
            onClick={onBack}
            className="mt-6 text-text-muted text-xs hover:text-text-primary transition-colors"
          >
            ◀ {tPortfolio("backToTitle")}
          </button>
        </main>
      </div>
    </div>
  );
}
