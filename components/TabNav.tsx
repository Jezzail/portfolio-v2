"use client";

import type { PortfolioTab } from "@/types";

type TabNavProps = {
  activeTab: PortfolioTab;
  onTabChange: (tab: PortfolioTab) => void;
  onAskPablo: () => void;
};

export function TabNav({ activeTab, onTabChange, onAskPablo }: TabNavProps) {
  return <nav>TabNav</nav>;
}
