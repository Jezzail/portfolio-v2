"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TitleScreen } from "@/components/TitleScreen";
import { PortfolioScreen } from "@/components/PortfolioScreen";
import { ChatScreen } from "@/components/ChatScreen";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<"title" | "portfolio">(
    "title",
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-text-primary">
      <AnimatePresence mode="wait">
        {activeScreen === "title" && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-215"
          >
            <TitleScreen onStart={() => setActiveScreen("portfolio")} />
          </motion.div>
        )}

        {activeScreen === "portfolio" && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PortfolioScreen
              onOpenChat={() => setIsChatOpen(true)}
              onBack={() => setActiveScreen("title")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <ChatScreen onClose={() => setIsChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
