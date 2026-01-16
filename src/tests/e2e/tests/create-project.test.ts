import { expect, test } from "@playwright/test";
import {
  authenticate,
  clearStorage,
  navigateTo,
  takeScreenshot,
  typeText,
  waitForElementVisible,
} from "../utils/helpers";

test.describe("Project Creation E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage, then authenticate
    await clearStorage(page);
    await authenticate(page);
  });

  test("should navigate to new project page", async ({ page }) => {
    try {
      await navigateTo(page, "/console/new-project");

      // Wait for the page to load
      await page.waitForTimeout(2000);

      // Verify we're not redirected to signin (authentication check)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/signin");

      // Check if the page contains expected elements
      const projectInput = page.locator('input[type="text"]');
      await waitForElementVisible(page, 'input[type="text"]');

      const placeholder = await projectInput.getAttribute("placeholder");
      expect(placeholder).toContain("Enter your project name");
    } catch (error) {
      await takeScreenshot(page, "project-creation-navigation-error");
      throw error;
    }
  });

  test("should display project creation form correctly", async ({ page }) => {
    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      // Verify we're not redirected to signin
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/signin");

      // Check for input field
      const input = page.locator('input[type="text"]');
      await waitForElementVisible(page, 'input[type="text"]');

      // Check for Continue button
      const button = page.locator("button:has-text('Continue')");
      const buttonVisible = await button.isVisible();
      expect(buttonVisible).toBe(true);

      // Button should be disabled when input is empty
      const isButtonEnabled = await button.isEnabled();
      expect(isButtonEnabled).toBe(false);
    } catch (error) {
      await takeScreenshot(page, "project-creation-form-error");
      throw error;
    }
  });

  test("should enable button when project name is entered", async ({
    page,
  }) => {
    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      const input = page.locator('input[type="text"]');
      const button = page.locator("button:has-text('Continue')");

      // Button should be disabled initially
      expect(await button.isEnabled()).toBe(false);

      // Enter project name
      await typeText(page, 'input[type="text"]', "Test Project");

      // Button should be enabled now
      await page.waitForTimeout(300);
      expect(await button.isEnabled()).toBe(true);
    } catch (error) {
      await takeScreenshot(page, "project-creation-button-state-error");
      throw error;
    }
  });

  test("should create project successfully", async ({ page }) => {
    // Mock API response for project creation
    let projectId: number | null = null;

    await page.route("**/api/CreateNewProject", async (route) => {
      projectId = Math.floor(Math.random() * 10000) + 1000; // Generate a mock project ID
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(projectId),
      });
    });

    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      // Enter project name
      const projectName = `Test Project ${Date.now()}`;
      await typeText(page, 'input[type="text"]', projectName);

      // Click Continue button and wait for navigation
      const button = page.locator("button:has-text('Continue')");

      await Promise.all([
        page.waitForURL("**/console/project/*", { timeout: 10000 }),
        button.click(),
      ]);

      // Verify navigation to project details page
      const currentUrl = page.url();
      expect(currentUrl).toContain("/console/project/");

      // Verify project ID is in the URL
      if (projectId) {
        expect(currentUrl).toContain(`/console/project/${projectId}`);
      }
    } catch (error) {
      await takeScreenshot(page, "project-creation-success-error");
      throw error;
    }
  });

  test("should create project using Enter key", async ({ page }) => {
    // Mock API response for project creation
    const projectId = Math.floor(Math.random() * 10000) + 1000;

    await page.route("**/api/CreateNewProject", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(projectId),
      });
    });

    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      // Enter project name
      const projectName = `Test Project Enter ${Date.now()}`;
      await typeText(page, 'input[type="text"]', projectName);

      // Press Enter key
      const input = page.locator('input[type="text"]');

      await Promise.all([
        page.waitForURL("**/console/project/*", { timeout: 10000 }),
        input.press("Enter"),
      ]);

      // Verify navigation to project details page
      const currentUrl = page.url();
      expect(currentUrl).toContain("/console/project/");
    } catch (error) {
      await takeScreenshot(page, "project-creation-enter-key-error");
      throw error;
    }
  });

  test("should show loading state while creating project", async ({ page }) => {
    // Mock API response with delay to see loading state
    await page.route("**/api/CreateNewProject", async (route) => {
      await page.waitForTimeout(1000); // Simulate API delay
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(12345),
      });
    });

    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      // Enter project name
      await typeText(page, 'input[type="text"]', "Loading Test Project");

      // Click Continue button
      const button = page.locator("button:has-text('Continue')");
      await button.click();

      // Check for loading state (button should show "Adding..." or spinner)
      const buttonText = await button.textContent();
      const hasLoadingState =
        buttonText?.includes("Adding") ||
        buttonText?.includes("...") ||
        (await button.locator("div.animate-spin").count()) > 0;

      // Button should be disabled during loading
      const isDisabled = await button.isDisabled();
      expect(isDisabled).toBe(true);
      expect(hasLoadingState).toBe(true);

      // Wait for navigation (project creation completes)
      await page.waitForURL("**/console/project/*", { timeout: 10000 });
    } catch (error) {
      await takeScreenshot(page, "project-creation-loading-error");
      throw error;
    }
  });

  test("should handle project creation error", async ({ page }) => {
    // Mock API response with error
    await page.route("**/api/CreateNewProject", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      // Enter project name
      await typeText(page, 'input[type="text"]', "Error Test Project");

      // Click Continue button
      const button = page.locator("button:has-text('Continue')");
      await button.click();

      // Wait for error toast/message to appear
      await page.waitForTimeout(2000);

      // Verify we're still on new-project page (navigation didn't happen)
      const currentUrl = page.url();
      expect(currentUrl).toContain("/console/new-project");

      // Check for error message
      const pageSource = await page.content();
      const hasError =
        pageSource.includes("Error") ||
        pageSource.includes("Failed") ||
        pageSource.includes("Failed to create project");

      expect(hasError).toBe(true);

      // Button should be enabled again after error
      const isButtonEnabled = await button.isEnabled();
      expect(isButtonEnabled).toBe(true);
    } catch (error) {
      await takeScreenshot(page, "project-creation-error-handling-error");
      throw error;
    }
  });

  test("should not allow empty project name", async ({ page }) => {
    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      const button = page.locator("button:has-text('Continue')");

      // Button should be disabled when input is empty
      expect(await button.isEnabled()).toBe(false);

      // Try typing spaces only
      await typeText(page, 'input[type="text"]', "   ");

      // Button should still be disabled (trimmed value is empty)
      await page.waitForTimeout(300);
      expect(await button.isEnabled()).toBe(false);
    } catch (error) {
      await takeScreenshot(page, "project-creation-validation-error");
      throw error;
    }
  });

  test("should navigate to project details after creation", async ({
    page,
  }) => {
    // Mock API response
    const projectId = 9999;

    await page.route("**/api/CreateNewProject", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(projectId),
      });
    });

    // Mock GetUser API to return project in user data
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: projectId,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    try {
      await navigateTo(page, "/console/new-project");

      await page.waitForTimeout(1000);

      // Enter project name
      await typeText(page, 'input[type="text"]', "Navigation Test Project");

      // Click Continue button
      const button = page.locator("button:has-text('Continue')");

      await Promise.all([
        page.waitForURL(`**/console/project/${projectId}`, { timeout: 10000 }),
        button.click(),
      ]);

      // Verify we're on the project details page
      const currentUrl = page.url();
      expect(currentUrl).toContain(`/console/project/${projectId}`);

      // Verify page loaded (check for project-related content)
      await page.waitForTimeout(2000);
      const pageSource = await page.content();
      expect(pageSource.length).toBeGreaterThan(0);
    } catch (error) {
      await takeScreenshot(page, "project-creation-navigation-details-error");
      throw error;
    }
  });
});
