import { expect, test } from "@playwright/test";
import {
  authenticate,
  clearStorage,
  isElementPresent,
  navigateTo,
  takeScreenshot,
  waitForElementVisible,
} from "../utils/helpers";

test.describe("Survey Creation E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage, then authenticate
    await clearStorage(page);
    await authenticate(page);
  });

  test("should navigate to new survey page", async ({ page }) => {
    try {
      // User is authenticated via beforeEach
      const projectId = "189"; // This would come from test setup or API
      await navigateTo(page, `/console/new-survey/${projectId}`);

      // Wait for the page to load
      await page.waitForTimeout(2000);

      // Verify we're not redirected to signin (authentication check)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/signin");

      // Check if the page contains expected elements
      const pageSource = await page.content();

      // Should contain survey creation related text
      expect(
        pageSource.includes("What topic do you want to explore?") ||
          pageSource.includes("New Survey") ||
          pageSource.includes("AutocompleteBrand")
      ).toBe(true);
    } catch (error) {
      await takeScreenshot(page, "survey-creation-navigation-error");
      throw error;
    }
  });

  test("should display brand autocomplete input", async ({ page }) => {
    try {
      // User is authenticated via beforeEach
      const projectId = "189";
      await navigateTo(page, `/console/new-survey/${projectId}`);

      // Verify we're not redirected to signin
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/signin");

      await page.waitForTimeout(2000);

      // Look for input field (brand autocomplete typically has an input)
      // The exact selector depends on your AutocompleteBrand component
      const hasInput = await isElementPresent(page, 'input[type="text"]', 5000);

      // If there's an input, check if it's visible
      if (hasInput) {
        await waitForElementVisible(page, 'input[type="text"]');
      }

      // Alternative: check for any input or textarea
      const hasAnyInput = await isElementPresent(page, "input, textarea", 5000);
      expect(hasAnyInput).toBe(true);
    } catch (error) {
      await takeScreenshot(page, "survey-creation-autocomplete-error");
      throw error;
    }
  });

  test("should handle survey creation flow", async ({ page }) => {
    try {
      // User is authenticated via beforeEach
      const projectId = "189";
      await navigateTo(page, `/console/new-survey/${projectId}`);

      // Verify we're not redirected to signin
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/signin");

      await page.waitForTimeout(2000);

      const pageSource = await page.content();

      // Verify we're on the new survey page
      expect(
        pageSource.includes("What topic do you want to explore?") ||
          pageSource.includes("new-survey")
      ).toBe(true);
    } catch (error) {
      await takeScreenshot(page, "survey-creation-flow-error");
      throw error;
    }
  });
});
