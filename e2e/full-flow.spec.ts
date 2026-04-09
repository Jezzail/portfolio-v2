/**
 * E2E test — Full user flow
 *
 * Simulates a real visitor landing on the portfolio:
 * 1. TitleScreen loads with "PRESS START"
 * 2. Clicking PRESS START transitions to the PortfolioScreen
 * 3. The STATS section (default tab) is visible
 *
 * This is the critical happy path — if this breaks, the site is unusable.
 */

import { test, expect } from "@playwright/test";

test.describe("Full user flow", () => {
  test("land on TitleScreen → click PRESS START → PortfolioScreen appears", async ({
    page,
  }) => {
    await page.goto("/");

    // Title screen should be visible
    await expect(page.getByText("PRESS START")).toBeVisible();
    await expect(page.getByText("PABLO ABRIL").first()).toBeVisible();

    // Click PRESS START (the whole screen is clickable)
    await page.getByText("PRESS START").click();

    // Portfolio screen should appear with default STATS tab
    await expect(page.getByText("CHARACTER STATS")).toBeVisible({
      timeout: 5000,
    });
  });
});
