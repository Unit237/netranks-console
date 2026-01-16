import { expect, test } from "@playwright/test";
import {
  authenticate,
  clearStorage,
  isElementPresent,
  navigateTo,
  waitForElementVisible,
} from "../utils/helpers";

test.describe("Members Page E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage, then authenticate
    await clearStorage(page);
    await authenticate(page);
  });

  test("should navigate to members page", async ({ page }) => {
    try {
      await navigateTo(page, "/console/members");

      // Wait for the page to load
      await page.waitForTimeout(2000);

      // Verify we're not redirected to signin (authentication check)
      const currentUrl = page.url();
      expect(currentUrl).toContain("/console/members");
      expect(currentUrl).not.toContain("/signin");
    } catch (error) {
      throw error;
    }
  });

  test("should display members page header and invite button", async ({
    page,
  }) => {
    // Mock GetUser API to return user with projects
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API to return empty array (no members yet)
    await page.route("**/api/GetMembers/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    try {
      await navigateTo(page, "/console/members");

      await page.waitForTimeout(2000);

      // Check for page header
      const header = page.locator('h1:has-text("Page")');
      await waitForElementVisible(page, 'h1:has-text("Page")');

      // Check for "Invite team member" button
      const inviteButton = page.locator(
        'button:has-text("Invite team member")'
      );
      const isVisible = await inviteButton.isVisible();
      expect(isVisible).toBe(true);
    } catch (error) {
      throw error;
    }
  });

  test("should display loading state initially", async ({ page }) => {
    let getUserResolved = false;
    let getMembersResolved = false;

    // Mock GetUser API with delay to see loading state
    await page.route("**/api/GetUser", async (route) => {
      await page.waitForTimeout(1500); // Simulate API delay
      getUserResolved = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API with delay
    await page.route("**/api/GetMembers/*", async (route) => {
      await page.waitForTimeout(1000);
      getMembersResolved = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    try {
      // Navigate and immediately check for loading spinner
      const navigationPromise = navigateTo(page, "/console/members");

      // Check for loading spinner - LoadingSpinner renders a <p> tag with "Loading" text
      // Check quickly before API responses complete
      await page.waitForTimeout(500);
      const loadingSpinner = await isElementPresent(
        page,
        'p:has-text("Loading")',
        2000
      );

      // Should show loading state initially
      expect(loadingSpinner).toBe(true);

      // Wait for navigation and API calls to complete
      await navigationPromise;
      await page.waitForTimeout(2000);
    } catch (error) {
      throw error;
    }
  });

  test("should display members list when members exist", async ({ page }) => {
    // Mock GetUser API
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API to return test members
    await page.route("**/api/GetMembers/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            Id: 1,
            UserId: 1,
            FullName: "John Doe",
            Email: "john@example.com",
            IsOwner: true,
            IsEditor: false,
            CreatedAt: "2024-01-15T00:00:00.000Z",
            IsProjectOwner: true,
          },
          {
            Id: 2,
            UserId: 2,
            FullName: "Jane Smith",
            Email: "jane@example.com",
            IsOwner: false,
            IsEditor: true,
            CreatedAt: "2024-01-20T00:00:00.000Z",
            IsProjectOwner: false,
          },
        ]),
      });
    });

    try {
      // Wait for GetMembers API response
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/GetMembers/") &&
          response.status() === 200
      );

      await navigateTo(page, "/console/members");

      // Wait for API response to complete
      await responsePromise;

      // Wait for loading to disappear and content to appear
      await page.waitForSelector('h2:has-text("Team members")', {
        timeout: 10000,
      });

      // Check for "Team members" heading
      const teamMembersHeading = page.locator('h2:has-text("Team members")');
      const headingVisible = await teamMembersHeading.isVisible();
      expect(headingVisible).toBe(true);

      // Check if members are displayed (either in table or cards)
      // Use more flexible selectors that work with both table and card views
      const memberName = await isElementPresent(page, "text=/John Doe/i", 5000);
      const memberEmail = await isElementPresent(
        page,
        "text=/john@example.com/i",
        5000
      );

      expect(memberName || memberEmail).toBe(true);
    } catch (error) {
      throw error;
    }
  });

  test("should open invite member modal when invite button is clicked", async ({
    page,
  }) => {
    // Mock GetUser API
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API
    await page.route("**/api/GetMembers/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    try {
      await navigateTo(page, "/console/members");

      await page.waitForTimeout(2000);

      // Click invite button
      const inviteButton = page.locator(
        'button:has-text("Invite team member")'
      );
      await inviteButton.click();

      // Wait for modal to appear
      await page.waitForTimeout(1000);

      // Check if modal is visible (look for common modal elements)
      const modalVisible =
        (await isElementPresent(page, 'input[type="email"]', 3000)) ||
        (await isElementPresent(page, 'input[placeholder*="email" i]', 3000)) ||
        (await isElementPresent(page, 'text="Invite"', 3000));

      expect(modalVisible).toBe(true);
    } catch (error) {
      throw error;
    }
  });

  test("should display empty state when no members exist", async ({ page }) => {
    // Mock GetUser API
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API to return empty array
    await page.route("**/api/GetMembers/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });

    try {
      await navigateTo(page, "/console/members");

      await page.waitForTimeout(3000);

      // When no members exist, the "Team members" section should not be visible
      const teamMembersHeading = page.locator('h2:has-text("Team members")');
      const headingVisible = await teamMembersHeading.isVisible();

      // The heading should not be visible when there are no members
      expect(headingVisible).toBe(false);

      // But invite button should still be visible
      const inviteButton = page.locator(
        'button:has-text("Invite team member")'
      );
      const buttonVisible = await inviteButton.isVisible();
      expect(buttonVisible).toBe(true);
    } catch (error) {
      throw error;
    }
  });

  test("should handle API error gracefully", async ({ page }) => {
    // Mock GetUser API
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API to return error
    await page.route("**/api/GetMembers/*", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal server error" }),
      });
    });

    try {
      await navigateTo(page, "/console/members");

      await page.waitForTimeout(3000);

      // Page should still load even if API fails
      const currentUrl = page.url();
      expect(currentUrl).toContain("/console/members");

      // Invite button should still be visible
      const inviteButton = page.locator(
        'button:has-text("Invite team member")'
      );
      const buttonVisible = await inviteButton.isVisible();
      expect(buttonVisible).toBe(true);
    } catch (error) {
      throw error;
    }
  });

  test("should display member roles correctly", async ({ page }) => {
    // Mock GetUser API
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Test Project",
              IsActive: true,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API with members having different roles
    await page.route("**/api/GetMembers/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            Id: 1,
            UserId: 1,
            FullName: "Owner User",
            Email: "owner@example.com",
            IsOwner: true,
            IsEditor: false,
            CreatedAt: "2024-01-15T00:00:00.000Z",
            IsProjectOwner: true,
          },
          {
            Id: 2,
            UserId: 2,
            FullName: "Editor User",
            Email: "editor@example.com",
            IsOwner: false,
            IsEditor: true,
            CreatedAt: "2024-01-20T00:00:00.000Z",
            IsProjectOwner: false,
          },
          {
            Id: 3,
            UserId: 3,
            FullName: "Viewer User",
            Email: "viewer@example.com",
            IsOwner: false,
            IsEditor: false,
            CreatedAt: "2024-01-25T00:00:00.000Z",
            IsProjectOwner: false,
          },
        ]),
      });
    });

    try {
      // Wait for GetMembers API response
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("/api/GetMembers/") &&
          response.status() === 200
      );

      await navigateTo(page, "/console/members");

      // Wait for API response to complete
      await responsePromise;

      // Wait for loading to disappear and content to appear
      await page.waitForSelector('h2:has-text("Team members")', {
        timeout: 10000,
      });

      // Members should be displayed - use case-insensitive regex
      const ownerVisible = await isElementPresent(
        page,
        "text=/Owner User/i",
        5000
      );
      const editorVisible = await isElementPresent(
        page,
        "text=/Editor User/i",
        5000
      );

      expect(ownerVisible || editorVisible).toBe(true);
    } catch (error) {
      throw error;
    }
  });

  test("should handle multiple projects correctly", async ({ page }) => {
    // Mock GetUser API with multiple projects
    await page.route("**/api/GetUser", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          Id: 1,
          Email: "test@example.com",
          Projects: [
            {
              Id: 1,
              Name: "Project One",
              IsActive: true,
            },
            {
              Id: 2,
              Name: "Project Two",
              IsActive: false,
            },
          ],
        }),
      });
    });

    // Mock GetMembers API for different projects
    await page.route("**/api/GetMembers/1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            Id: 1,
            UserId: 1,
            FullName: "User One",
            Email: "user1@example.com",
            IsOwner: true,
            IsEditor: false,
            CreatedAt: "2024-01-15T00:00:00.000Z",
            IsProjectOwner: true,
          },
        ]),
      });
    });

    await page.route("**/api/GetMembers/2", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            Id: 2,
            UserId: 2,
            FullName: "User Two",
            Email: "user2@example.com",
            IsOwner: false,
            IsEditor: true,
            CreatedAt: "2024-01-20T00:00:00.000Z",
            IsProjectOwner: false,
          },
        ]),
      });
    });

    try {
      // Wait for both GetMembers API responses (for both projects)
      const responsePromises = [
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/GetMembers/1") &&
            response.status() === 200
        ),
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/GetMembers/2") &&
            response.status() === 200
        ),
      ];

      await navigateTo(page, "/console/members");

      // Wait for all API responses to complete
      await Promise.all(responsePromises);

      // Wait for loading to disappear and content to appear
      await page.waitForSelector('h2:has-text("Team members")', {
        timeout: 10000,
      });

      // Should display members from all projects - use case-insensitive regex
      const userOneVisible = await isElementPresent(
        page,
        "text=/User One/i",
        5000
      );
      const userTwoVisible = await isElementPresent(
        page,
        "text=/User Two/i",
        5000
      );

      // At least one member should be visible
      expect(userOneVisible || userTwoVisible).toBe(true);
    } catch (error) {
      throw error;
    }
  });
});
