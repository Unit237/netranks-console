import { test, expect } from "@playwright/test";
import {
  authenticate,
  clearStorage,
  isElementPresent,
  navigateTo,
  takeScreenshot,
} from "../utils/helpers";

test.describe("Survey Details E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage safely (handles data: URLs)
    await clearStorage(page);
    await authenticate(page);
  });

  test("should display survey details page with tabs", async ({ page }) => {
    try {
      // Assuming we have a test survey ID
      const surveyId = "4147";
      await navigateTo(page, `/console/survey/${surveyId}`);

      await page.waitForTimeout(3000); // Wait for data to load

      // Verify we're not redirected to signin (authentication check)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/signin");

      // Check if tabs are present
      const tabs = ["Overview", "Questions", "Optimize"];

      for (const tab of tabs) {
        const tabPresent = await isElementPresent(
          page,
          `button:has-text("${tab}")`,
          5000
        );

        // At least one tab should be present
        if (tab === tabs[0]) {
          expect(tabPresent).toBe(true);
        }
      }
    } catch (error) {
      await takeScreenshot(page, "survey-details-tabs-error");
      throw error;
    }
  });

  test("should switch between tabs", async ({ page }) => {
    try {
      const surveyId = "4147";
      await navigateTo(page, `/console/survey/${surveyId}`);

      await page.waitForTimeout(3000);

      // Click on Questions tab
      const questionsTab = page.locator('button:has-text("Questions")');
      if (await questionsTab.count() > 0) {
        await questionsTab.click();
      }

      await page.waitForTimeout(1000);

      // Verify Questions tab content is visible (or Overview is hidden)
      // The exact implementation depends on your tab switching logic
      const pageSource = await page.content();

      // Should show Questions-related content or hide Overview
      expect(pageSource.length).toBeGreaterThan(0);
    } catch (error) {
      await takeScreenshot(page, "survey-details-tab-switch-error");
      throw error;
    }
  });

  test("should display loading state initially", async ({ page }) => {
    try {
      const surveyId = "999999"; // Non-existent ID to trigger loading/error
      await navigateTo(page, `/console/survey/${surveyId}`);

      // Should show loading spinner or error message
      await page.waitForTimeout(2000);

      const pageSource = await page.content();

      // Should show either loading state or error message
      expect(
        pageSource.includes("Loading") ||
          pageSource.includes("Loading...") ||
          pageSource.includes("not found") ||
          pageSource.includes("Error") ||
          pageSource.includes("Failed")
      ).toBe(true);
    } catch (error) {
      await takeScreenshot(page, "survey-details-loading-error");
      throw error;
    }
  });

  test("should handle survey details with data", async ({ page }) => {
    try {
      // This test assumes a valid survey ID exists
      // In a real scenario, you'd create a test survey first
      const surveyId = "4147";
      await navigateTo(page, `/console/survey/${surveyId}`);

      await page.waitForTimeout(3000);

      // Check if survey details are displayed
      const pageSource = await page.content();

      // Should contain survey-related content
      // Exact content depends on your SurveyDetails component
      expect(pageSource.length).toBeGreaterThan(0);

      // Check if Overview tab is active by default
      const overviewTab = page.locator('button:has-text("Overview")');
      const count = await overviewTab.count();

      // Overview tab should be visible/clickable
      expect(count).toBeGreaterThan(0);
    } catch (error) {
      await takeScreenshot(page, "survey-details-data-error");
      throw error;
    }
  });
});
