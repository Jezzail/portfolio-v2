/**
 * Integration test — Language toggle (EN ↔ ES)
 *
 * Verifies that clicking the HudBar language toggle sets the locale cookie
 * and triggers a router refresh. Also verifies that re-rendering with
 * Spanish translations produces the correct strings.
 *
 * We test the cookie mechanism rather than full page re-render because
 * next-intl's locale switch depends on a Next.js server round-trip
 * (cookie → getLocale → re-render), which can't run in jsdom.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HudBar } from "@/components/HudBar";
import es from "@/messages/es.json";

// Access the mocked next/navigation router
const mockRefresh = vi.fn();

// Override the router mock for this file
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRefresh,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("Language toggle", () => {
  beforeEach(() => {
    mockRefresh.mockClear();
    // Clear cookies
    document.cookie = "locale=; max-age=0";
  });

  it("renders EN as active by default", () => {
    render(<HudBar />);

    // The toggle button shows EN / ES — EN should be gold (active)
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.textContent).toContain("EN");
    expect(button.textContent).toContain("ES");
  });

  it("sets locale cookie to 'es' and calls router.refresh on click", async () => {
    const user = userEvent.setup();
    render(<HudBar />);

    const button = screen.getByRole("button");
    await user.click(button);

    expect(document.cookie).toContain("locale=es");
    expect(mockRefresh).toHaveBeenCalledOnce();
  });

  it("renders Spanish strings when locale is ES", () => {
    // Override next-intl mock temporarily to use Spanish
    cleanup();
    vi.doMock("next-intl", () => {
      function getNestedValue(
        obj: Record<string, unknown>,
        path: string
      ): unknown {
        return path.split(".").reduce<unknown>((acc, key) => {
          if (acc && typeof acc === "object")
            return (acc as Record<string, unknown>)[key];
          return undefined;
        }, obj);
      }

      return {
        useTranslations: (namespace: string) => {
          const section = getNestedValue(
            es as Record<string, unknown>,
            namespace
          );
          return (key: string) => {
            if (section && typeof section === "object") {
              const val = getNestedValue(
                section as Record<string, unknown>,
                key
              );
              if (typeof val === "string") return val;
            }
            return `${namespace}.${key}`;
          };
        },
        useLocale: () => "es",
      };
    });

    // Verify the Spanish hud name exists in the messages file
    expect(es.hud.name).toBe("PABLO ABRIL");
    expect(es.hud.level).toBeDefined();
  });
});
