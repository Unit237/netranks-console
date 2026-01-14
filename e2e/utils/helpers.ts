import { Page, Locator } from "playwright";
import { E2E_CONFIG } from "../config";
import * as fs from "fs";
import * as path from "path";

export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: "attached", timeout });
  return locator;
}

export async function waitForElementVisible(
  page: Page,
  selector: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<Locator> {
  const locator = page.locator(selector);
  await locator.waitFor({ state: "visible", timeout });
  return locator;
}

export async function clickElement(
  page: Page,
  selector: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<void> {
  const locator = await waitForElementVisible(page, selector, timeout);
  await locator.click();
}

export async function typeText(
  page: Page,
  selector: string,
  text: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<void> {
  const locator = await waitForElementVisible(page, selector, timeout);
  await locator.fill(text);
}

export async function getText(
  page: Page,
  selector: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<string> {
  const locator = await waitForElementVisible(page, selector, timeout);
  return await locator.textContent() || "";
}

export async function isElementPresent(
  page: Page,
  selector: string,
  timeout: number = 5000
): Promise<boolean> {
  try {
    const locator = page.locator(selector);
    await locator.waitFor({ state: "attached", timeout });
    return await locator.count() > 0;
  } catch {
    return false;
  }
}

export async function takeScreenshot(
  page: Page,
  filename: string
): Promise<void> {
  if (!E2E_CONFIG.screenshotOnFailure) {
    return;
  }

  try {
    const screenshotDir = E2E_CONFIG.screenshotDir;
    
    // Ensure the screenshot directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const filepath = path.join(screenshotDir, `${filename}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`Screenshot saved: ${filepath}`);
  } catch (error) {
    console.warn(`Failed to save screenshot ${filename}:`, error);
    // Don't throw - screenshot failures shouldn't break tests
  }
}

export async function navigateTo(page: Page, path: string): Promise<void> {
  const url = `${E2E_CONFIG.baseUrl}${path}`;
  await page.goto(url, { waitUntil: "networkidle" });
}

export async function waitForUrl(
  page: Page,
  expectedPath: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<void> {
  await page.waitForURL(`**${expectedPath}**`, { timeout });
}

export async function clearStorage(page: Page): Promise<void> {
  try {
    // Navigate to a valid URL first if we're on a data: URL
    const currentUrl = page.url();
    if (currentUrl.startsWith("data:")) {
      await page.goto(E2E_CONFIG.baseUrl);
      await page.waitForLoadState("domcontentloaded");
    }
    
    // Clear cookies and storage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    // Ignore errors if storage is not available
  }
}

export async function authenticate(page: Page, userToken?: string): Promise<void> {
  // Navigate to base URL first to ensure we're on a valid page
  await page.goto(E2E_CONFIG.baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000); // Wait for page to load

  try {
    // Set visitor token (for anonymous access)
    const visitorToken = "test-visitor-token-" + Date.now();
    await page.evaluate(
      (token) => {
        localStorage.setItem("visitorToken", token);
      },
      visitorToken
    );

    // Set user token (for authenticated access)
    const tokenToUse =
      userToken ||
      E2E_CONFIG.testUserToken ||
      "test-user-token-" + Date.now();
    await page.evaluate(
      (token) => {
        localStorage.setItem("userToken", token);
      },
      tokenToUse
    );

    // Set cookies for compatibility
    await page.context().addCookies([
      { name: "visitorToken", value: visitorToken, url: E2E_CONFIG.baseUrl },
      { name: "userToken", value: tokenToUse, url: E2E_CONFIG.baseUrl },
    ]);

    // Refresh the page to apply authentication
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000); // Wait for page to recognize authentication

    // Verify we're not redirected to signin
    const currentUrl = page.url();
    if (currentUrl.includes("/signin")) {
      throw new Error("Authentication failed - redirected to signin page");
    }
  } catch (error) {
    console.warn("Authentication setup failed:", error);
    throw error;
  }
}
