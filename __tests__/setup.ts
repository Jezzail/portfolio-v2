/**
 * Vitest global setup — mocks next-intl, next/navigation, and framer-motion
 * so React component tests can render without a real Next.js runtime.
 *
 * Translations are loaded from messages/en.json (the primary locale) so
 * assertions can match actual user-facing strings.
 */

import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";
import en from "../messages/en.json";

// ── Helpers ──────────────────────────────────────────────────────────────

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object")
      return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

// ── Mock: next-intl ──────────────────────────────────────────────────────

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const section = getNestedValue(en as Record<string, unknown>, namespace);
    const t = (key: string) => {
      if (section && typeof section === "object") {
        const val = getNestedValue(section as Record<string, unknown>, key);
        if (typeof val === "string") return val;
      }
      return `${namespace}.${key}`;
    };
    return t;
  },
  useLocale: () => "en",
}));

// ── Mock: next/navigation ────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// ── Mock: framer-motion ──────────────────────────────────────────────────
// Replaces motion.* with plain HTML elements so tests don't depend on the
// Web Animations API (unavailable in jsdom).

vi.mock("framer-motion", () => {
  const motionProxy = new Proxy(
    {},
    {
      get(_target, prop: string) {
        return React.forwardRef(function MotionMock(
          props: Record<string, unknown>,
          ref: React.Ref<HTMLElement>,
        ) {
          // Strip framer-motion-specific props before passing to DOM
          const {
            initial: _i,
            animate: _a,
            exit: _e,
            transition: _t,
            variants: _v,
            whileHover: _wh,
            whileTap: _wt,
            whileFocus: _wf,
            whileInView: _wiv,
            layout: _l,
            layoutId: _li,
            ...domProps
          } = props;
          return React.createElement(prop, { ...domProps, ref });
        });
      },
    },
  );

  return {
    motion: motionProxy,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: vi.fn(),
    }),
  };
});
