import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver } from "../utils/driver";
import {
  authenticate,
  clearStorage,
  isElementPresent,
  navigateTo,
  takeScreenshot,
  waitForElementVisible,
} from "../utils/helpers";

describe("Survey Creation E2E Tests", () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
    // Authenticate before running tests
    // This sets visitorToken and userToken in localStorage
    await authenticate(driver);
  });

  afterAll(async () => {
    await quitDriver();
  });

  beforeEach(async () => {
    // Clear cookies and storage, then re-authenticate
    await clearStorage(driver);
    await authenticate(driver);
  });

  test("should navigate to new survey page", async () => {
    try {
      // User is authenticated via beforeAll/beforeEach
      const projectId = "189"; // This would come from test setup or API
      await navigateTo(driver, `/console/new-survey/${projectId}`);

      // Wait for the page to load
      await driver.sleep(2000);

      // Verify we're not redirected to signin (authentication check)
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).not.toContain("/signin");

      // Check if the page contains expected elements
      const pageSource = await driver.getPageSource();

      // Should contain survey creation related text
      expect(
        pageSource.includes("What topic do you want to explore?") ||
          pageSource.includes("New Survey") ||
          pageSource.includes("AutocompleteBrand")
      ).toBe(true);
    } catch (error) {
      await takeScreenshot(driver, "survey-creation-navigation-error");
      throw error;
    }
  });

  test("should display brand autocomplete input", async () => {
    try {
      // User is authenticated via beforeAll/beforeEach
      const projectId = "189";
      await navigateTo(driver, `/console/new-survey/${projectId}`);

      // Verify we're not redirected to signin
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).not.toContain("/signin");

      await driver.sleep(2000);

      // Look for input field (brand autocomplete typically has an input)
      // The exact selector depends on your AutocompleteBrand component
      const hasInput = await isElementPresent(
        driver,
        'input[type="text"]',
        5000
      );

      // If there's an input, check if it's visible
      if (hasInput) {
        await waitForElementVisible(driver, 'input[type="text"]');
      }

      // Alternative: check for any input or textarea
      const hasAnyInput = await isElementPresent(
        driver,
        "input, textarea",
        5000
      );
      expect(hasAnyInput).toBe(true);
    } catch (error) {
      await takeScreenshot(driver, "survey-creation-autocomplete-error");
      throw error;
    }
  });

  test("should handle survey creation flow", async () => {
    try {
      // User is authenticated via beforeAll/beforeEach
      const projectId = "189";
      await navigateTo(driver, `/console/new-survey/${projectId}`);

      // Verify we're not redirected to signin
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).not.toContain("/signin");

      await driver.sleep(2000);

      // Try to find and interact with brand/query input
      // This is a simplified test - in reality you'd need to:
      // 1. Enter a brand name or query
      // 2. Wait for autocomplete suggestions
      // 3. Select a suggestion
      // 4. Navigate to review questions page

      const pageSource = await driver.getPageSource();

      // Verify we're on the new survey page
      expect(
        pageSource.includes("What topic do you want to explore?") ||
          pageSource.includes("new-survey")
      ).toBe(true);

      // Note: Full flow testing would require:
      // - Mock API responses for brand search
      // - Selecting a brand/query
      // - Verifying navigation to review questions
      // - Verifying survey creation completion
    } catch (error) {
      await takeScreenshot(driver, "survey-creation-flow-error");
      throw error;
    }
  });
});
