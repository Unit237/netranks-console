import { expect, test } from "@playwright/test";
import { E2E_CONFIG } from "../config";
import {
  clearStorage,
  navigateTo,
  typeText,
  waitForElementVisible,
} from "../utils/helpers";

test.describe("Authentication E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage safely (handles data: URLs)
    await clearStorage(page);
  });

  test("should display signin page correctly", async ({ page }) => {
    try {
      await navigateTo(page, "/signin");

      // Wait for email input field
      await waitForElementVisible(page, 'input[type="email"]');

      // Check if "Sign up or log In to NetRanks" text is present
      const pageText = await page.content();

      expect(pageText).toContain("Sign up or log In to NetRanks");

      // Check if email input placeholder is correct
      const emailInput = page.locator('input[type="email"]');
      const placeholder = await emailInput.getAttribute("placeholder");
      expect(placeholder).toContain("name@gmail.com");
    } catch (error) {
      // await takeScreenshot(page, "auth-signin-page-error");
      throw error;
    }
  });

  test("should submit magic link request", async ({ page }) => {
    // Intercept API call to mock successful response
    await page.route("**/api/CreateMagicLink", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await navigateTo(page, "/signin");

    // Wait for email input
    await waitForElementVisible(page, 'input[type="email"]');

    // Enter email
    await typeText(page, 'input[type="email"]', E2E_CONFIG.testUser.email);

    // Click send magic link button and wait for navigation
    const button = page.locator("button:has-text('Send Magic Link')");
    
    // Click button and wait for navigation to magic-link-sent page
    await Promise.all([
      page.waitForURL("**/magic-link-sent", { timeout: 10000 }),
      button.click(),
    ]);

    // Verify we're on the magic-link-sent page
    const currentUrl = page.url();
    expect(currentUrl).toContain("/magic-link-sent");
  });

  test("should validate email input", async ({ page }) => {
    try {
      await navigateTo(page, "/signin");

      // Wait for email input
      await waitForElementVisible(page, 'input[type="email"]');

      // Try to submit without email
      const button = page.locator("button:has-text('Send Magic Link')");
      const isEnabled = await button.isEnabled();

      // Button should be disabled when email is empty
      expect(isEnabled).toBe(false);

      // Enter invalid email
      await typeText(page, 'input[type="email"]', "invalid-email");

      // Check HTML5 validation
      const emailInput = page.locator('input[type="email"]');
      const validity = await emailInput.evaluate((el: HTMLInputElement) => {
        return el.validity.valid;
      });

      expect(validity).toBe(false);
    } catch (error) {
      // await takeScreenshot(page, "auth-email-validation-error");
      throw error;
    }
  });
});
