"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

function getThemeSnapshot(): Theme {
  const value = document.documentElement.dataset.theme;
  return value === "dark" || value === "light" ? value : "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function subscribeToTheme(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // private browsing — DOM update is enough
    }
  }, [theme]);

  return { theme, toggleTheme };
}
