"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TitleScreen } from "@/components/TitleScreen";
import { PortfolioScreen } from "@/components/PortfolioScreen";
import { ChatScreen } from "@/components/ChatScreen";
import { MagazineReader } from "@/components/MagazineReader";
import { magazineIssues } from "@/data/items";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<"title" | "portfolio">(
    "title",
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMagazineOpen, setIsMagazineOpen] = useState(false);
  const [selectedMagazineIssueIndex, setSelectedMagazineIssueIndex] =
    useState(0);

  // Used to suppress the popstate handler when we programmatically call history.back()
  const suppressPopState = useRef(false);

  // --- Forward navigation: push a history entry so back button has something to undo ---
  const handleStart = useCallback(() => {
    setActiveScreen("portfolio");
    history.pushState(null, "");
  }, []);

  const handleOpenChat = useCallback(() => {
    setIsChatOpen(true);
    history.pushState(null, "");
  }, []);

  const handleOpenMagazine = useCallback((index: number) => {
    setSelectedMagazineIssueIndex(index);
    setIsMagazineOpen(true);
    history.pushState(null, "");
  }, []);

  // --- Programmatic back: sync browser history with React state ---
  const handleBack = useCallback(() => {
    suppressPopState.current = true;
    setActiveScreen("title");
    history.back();
  }, []);

  const handleCloseChat = useCallback(() => {
    suppressPopState.current = true;
    setIsChatOpen(false);
    history.back();
  }, []);

  const handleCloseMagazine = useCallback(() => {
    suppressPopState.current = true;
    setIsMagazineOpen(false);
    history.back();
  }, []);

  // --- Browser back button handler ---
  useEffect(() => {
    const onPopState = () => {
      if (suppressPopState.current) {
        suppressPopState.current = false;
        return;
      }
      if (isMagazineOpen) {
        setIsMagazineOpen(false);
      } else if (isChatOpen) {
        setIsChatOpen(false);
      } else if (activeScreen === "portfolio") {
        setActiveScreen("title");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isMagazineOpen, isChatOpen, activeScreen]);

  return (
    <div
      id="main-content"
      className="relative min-h-dvh bg-background text-text-primary"
    >
      <AnimatePresence mode="wait">
        {activeScreen === "title" && (
          <motion.div
            key="title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-215 h-full"
          >
            <TitleScreen onStart={handleStart} />
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
              onOpenChat={handleOpenChat}
              onBack={handleBack}
              onOpenMagazine={handleOpenMagazine}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isChatOpen && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <ChatScreen onClose={handleCloseChat} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isMagazineOpen && (
          <motion.div
            key="magazine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MagazineReader
              issues={magazineIssues}
              initialIssueIndex={selectedMagazineIssueIndex}
              onClose={handleCloseMagazine}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
