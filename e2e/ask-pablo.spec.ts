/**
 * E2E test — Ask Pablo chat
 *
 * Opens the chat overlay, sends a message, and asserts a response appears.
 * The /api/chat route is intercepted so no real Anthropic API call is made.
 * The mock returns a streamed response with an emotion tag, just like the
 * real API would.
 *
 * Verifies the full chat flow: input → send → streaming response → display.
 */

import { test, expect } from "@playwright/test";

test.describe("Ask Pablo chat", () => {
  test("send a message and receive a mocked response", async ({ page }) => {
    // Intercept the chat API route with a fake streaming response
    await page.route("**/api/chat", async (route) => {
      const body = "[EMOTION:happy]Hey! Thanks for checking out my portfolio!";
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body,
      });
    });

    await page.goto("/");

    // Navigate past title screen
    await page.getByText("PRESS START").click();
    await expect(page.getByText("CHARACTER STATS")).toBeVisible({
      timeout: 5000,
    });

    // Open chat
    await page.getByText(/ASK PABLO/).click();
    await expect(
      page.getByPlaceholder(/type your question/i)
    ).toBeVisible({ timeout: 5000 });

    // Type a message and send
    const input = page.getByPlaceholder(/type your question/i);
    await input.fill("Tell me about yourself");
    await page.getByRole("button", { name: "SEND" }).click();

    // Assert the response appears (the emotion tag is stripped, text is shown)
    await expect(
      page.getByText(/Thanks for checking out my portfolio/)
    ).toBeVisible({ timeout: 10000 });
  });
});
