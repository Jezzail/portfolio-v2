"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Screen } from "@/types";
import { TitleScreen } from "@/components/TitleScreen";
import { PortfolioScreen } from "@/components/PortfolioScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { HudBar } from "@/components/HudBar";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("title");

  return (
    <div className="relative min-h-screen bg-background text-text-primary">
      {screen !== "title" && <HudBar />}

      <AnimatePresence mode="wait">
        {screen === "title" && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <TitleScreen onStart={() => setScreen("portfolio")} />
          </motion.div>
        )}

        {screen === "portfolio" && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PortfolioScreen onOpenChat={() => setScreen("chat")} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {screen === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <ChatScreen onClose={() => setScreen("portfolio")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
