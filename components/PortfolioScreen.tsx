"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PortfolioTab } from "@/types";
import { TabNav } from "@/components/TabNav";
import { StatsSection } from "@/components/StatsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { QuestsSection } from "@/components/QuestsSection";
import { ItemsSection } from "@/components/ItemsSection";

type PortfolioScreenProps = {
  onOpenChat: () => void;
};

export function PortfolioScreen({ onOpenChat }: PortfolioScreenProps) {
  const [activeTab, setActiveTab] = useState<PortfolioTab>("stats");

  return (
    <div className="flex flex-col min-h-screen">
      <TabNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAskPablo={onOpenChat}
      />

      {/* Content area */}
      <main className="flex-1 p-4 sm:p-6">
        <AnimatePresence mode="wait">
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
      </main>
    </div>
  );
}
