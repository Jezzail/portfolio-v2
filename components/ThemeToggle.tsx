"use client";

import { useTheme } from "@/lib/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="shrink-0 border-2 border-border bg-background px-2 sm:px-3 py-1.5 text-xs tracking-wider hover:border-border-active transition-colors"
    >
      <span
        className={theme === "dark" ? "text-accent-gold" : "text-text-muted"}
      >
        🌙
      </span>
      <span className="text-text-dim mx-1">/</span>
      <span
        className={theme === "light" ? "text-accent-gold" : "text-text-muted"}
      >
        ☀️
      </span>
    </button>
  );
}
