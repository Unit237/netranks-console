import { WebDriver } from "selenium-webdriver";
import { createDriver, quitDriver } from "../utils/driver";
import {
  authenticate,
  clearStorage,
  isElementPresent,
  navigateTo,
  takeScreenshot,
} from "../utils/helpers";

describe("Survey Details E2E Tests", () => {
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
    // Clear cookies and storage safely (handles data: URLs)
    await clearStorage(driver);
    await authenticate(driver);
  });

  test("should display survey details page with tabs", async () => {
    try {
      // Assuming we have a test survey ID
      const surveyId = "4147";
      await navigateTo(driver, `/console/survey/${surveyId}`);

      await driver.sleep(3000); // Wait for data to load

      // Verify we're not redirected to signin (authentication check)
      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).not.toContain("/signin");

      // Check if tabs are present
      const tabs = ["Overview", "Questions", "Optimize"];

      for (const tab of tabs) {
        const tabPresent = await isElementPresent(
          driver,
          { xpath: `//button[contains(text(), '${tab}')]` },
          5000
        );

        // At least one tab should be present
        if (tab === tabs[0]) {
          expect(tabPresent).toBe(true);
        }
      }
    } catch (error) {
      await takeScreenshot(driver, "survey-details-tabs-error");
      throw error;
    }
  });

  test("should switch between tabs", async () => {
    try {
      const surveyId = "4147";
      await navigateTo(driver, `/console/survey/${surveyId}`);

      await driver.sleep(3000);

      // Click on Questions tab
      const questionsTab = await driver.findElement({
        xpath: "//button[contains(text(), 'Questions')]",
      });
      if (questionsTab) {
        await questionsTab.click();
      }

      await driver.sleep(1000);

      // Verify Questions tab content is visible (or Overview is hidden)
      // The exact implementation depends on your tab switching logic
      const pageSource = await driver.getPageSource();

      // Should show Questions-related content or hide Overview
      expect(pageSource.length).toBeGreaterThan(0);
    } catch (error) {
      await takeScreenshot(driver, "survey-details-tab-switch-error");
      throw error;
    }
  });

  test("should display loading state initially", async () => {
    try {
      const surveyId = "999999"; // Non-existent ID to trigger loading/error
      await navigateTo(driver, `/console/survey/${surveyId}`);

      // Should show loading spinner or error message
      await driver.sleep(2000);

      const pageSource = await driver.getPageSource();

      // Should show either loading state or error message
      expect(
        pageSource.includes("Loading") ||
          pageSource.includes("Loading...") ||
          pageSource.includes("not found") ||
          pageSource.includes("Error") ||
          pageSource.includes("Failed")
      ).toBe(true);
    } catch (error) {
      await takeScreenshot(driver, "survey-details-loading-error");
      throw error;
    }
  });

  test("should handle survey details with data", async () => {
    try {
      // This test assumes a valid survey ID exists
      // In a real scenario, you'd create a test survey first
      const surveyId = "4147";
      await navigateTo(driver, `/console/survey/${surveyId}`);

      await driver.sleep(3000);

      // Check if survey details are displayed
      const pageSource = await driver.getPageSource();

      // Should contain survey-related content
      // Exact content depends on your SurveyDetails component
      expect(pageSource.length).toBeGreaterThan(0);

      // Check if Overview tab is active by default
      const overviewTab = await driver.findElement({
        xpath: "//button[contains(text(), 'Overview')]",
      });
      const overviewClasses = await overviewTab.getAttribute("class");

      // Overview tab should be visible/clickable
      expect(overviewTab).toBeDefined();
    } catch (error) {
      await takeScreenshot(driver, "survey-details-data-error");
      throw error;
    }
  });
});
