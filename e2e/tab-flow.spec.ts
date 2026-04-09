/**
 * E2E test — Tab flow
 *
 * After entering the portfolio, clicks through all 4 content tabs
 * (STATS, SKILLS, QUESTS, ITEMS) and the ASK PABLO button.
 * Asserts each section heading is visible after switching.
 *
 * Verifies the tab system works end-to-end in a real browser.
 */

import { test, expect } from "@playwright/test";

test.describe("Tab flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Navigate past title screen
    await page.getByText("PRESS START").click();
    await expect(page.getByText("CHARACTER STATS")).toBeVisible({
      timeout: 5000,
    });
  });

  test("STATS tab shows CHARACTER STATS heading", async ({ page }) => {
    // Already on STATS by default
    await expect(page.getByText("CHARACTER STATS")).toBeVisible();
  });

  test("SKILLS tab shows SKILLS & ABILITIES heading", async ({ page }) => {
    await page.getByRole("button", { name: "SKILLS" }).click();
    await expect(page.getByText("SKILLS & ABILITIES")).toBeVisible();
  });

  test("QUESTS tab shows QUEST LOG heading", async ({ page }) => {
    await page.getByRole("button", { name: "QUESTS" }).click();
    await expect(page.getByText("QUEST LOG")).toBeVisible();
  });

  test("ITEMS tab shows INVENTORY heading", async ({ page }) => {
    await page.getByRole("button", { name: "ITEMS" }).click();
    await expect(page.getByText("INVENTORY")).toBeVisible();
  });

  test("ASK PABLO opens the chat overlay", async ({ page }) => {
    await page.getByText(/ASK PABLO/).click();
    await expect(page.getByText("ASK PABLO").nth(1)).toBeVisible({
      timeout: 5000,
    });
    // Chat input should be present
    await expect(
      page.getByPlaceholder(/type your question/i)
    ).toBeVisible();
  });
});
