import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import { E2E_CONFIG } from '../config';
import * as fs from 'fs';
import * as path from 'path';

export async function waitForElement(
  driver: WebDriver,
  selector: string | { css?: string; xpath?: string },
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<WebElement> {
  const locator = typeof selector === 'string' 
    ? By.css(selector) 
    : (selector.xpath ? By.xpath(selector.xpath) : By.css(selector.css!));
  
  return await driver.wait(
    until.elementLocated(locator),
    timeout,
    `Element not found: ${JSON.stringify(selector)}`
  );
}

export async function waitForElementVisible(
  driver: WebDriver,
  selector: string | { css?: string; xpath?: string },
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<WebElement> {
  const element = await waitForElement(driver, selector, timeout);
  await driver.wait(
    until.elementIsVisible(element),
    timeout,
    `Element not visible: ${JSON.stringify(selector)}`
  );
  return element;
}

export async function clickElement(
  driver: WebDriver,
  selector: string | { css?: string; xpath?: string },
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<void> {
  const element = await waitForElementVisible(driver, selector, timeout);
  await element.click();
}

export async function typeText(
  driver: WebDriver,
  selector: string | { css?: string; xpath?: string },
  text: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<void> {
  const element = await waitForElementVisible(driver, selector, timeout);
  await element.clear();
  await element.sendKeys(text);
}

export async function getText(
  driver: WebDriver,
  selector: string | { css?: string; xpath?: string },
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<string> {
  const element = await waitForElementVisible(driver, selector, timeout);
  return await element.getText();
}

export async function isElementPresent(
  driver: WebDriver,
  selector: string | { css?: string; xpath?: string },
  timeout: number = 5000
): Promise<boolean> {
  try {
    await waitForElement(driver, selector, timeout);
    return true;
  } catch {
    return false;
  }
}

export async function takeScreenshot(
  driver: WebDriver,
  filename: string
): Promise<void> {
  if (!E2E_CONFIG.screenshotOnFailure) {
    return;
  }

  try {
    const screenshot = await driver.takeScreenshot();
    const screenshotDir = E2E_CONFIG.screenshotDir;
    
    // Ensure the screenshot directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const filepath = path.join(screenshotDir, `${filename}.png`);
    fs.writeFileSync(filepath, screenshot, 'base64');
    console.log(`Screenshot saved: ${filepath}`);
  } catch (error) {
    console.warn(`Failed to save screenshot ${filename}:`, error);
    // Don't throw - screenshot failures shouldn't break tests
  }
}

export async function navigateTo(driver: WebDriver, path: string): Promise<void> {
  const url = `${E2E_CONFIG.baseUrl}${path}`;
  await driver.get(url);
  await driver.wait(until.urlContains(path), E2E_CONFIG.pageLoadTimeout);
}

export async function waitForUrl(
  driver: WebDriver,
  expectedPath: string,
  timeout: number = E2E_CONFIG.defaultTimeout
): Promise<void> {
  await driver.wait(
    until.urlContains(expectedPath),
    timeout,
    `URL did not contain: ${expectedPath}`
  );
}

export async function clearStorage(driver: WebDriver): Promise<void> {
  try {
    // Navigate to a valid URL first if we're on a data: URL
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.startsWith('data:')) {
      await driver.get(E2E_CONFIG.baseUrl);
      // Wait a bit for the page to load
      await driver.sleep(500);
    }
    
    await driver.manage().deleteAllCookies();
    await driver.executeScript('window.localStorage.clear();');
    await driver.executeScript('window.sessionStorage.clear();');
  } catch (error) {
    // Ignore errors if storage is not available
    // This can happen if we're still on a data: URL or page hasn't loaded
  }
}

export async function authenticate(driver: WebDriver, userToken?: string): Promise<void> {
  // Navigate to base URL first to ensure we're on a valid page
  await driver.get(E2E_CONFIG.baseUrl);
  await driver.sleep(1000); // Wait for page to load

  try {
    // Set visitor token (for anonymous access)
    // In a real scenario, this would be created via CreateVisitorSession API
    const visitorToken = 'test-visitor-token-' + Date.now();
    await driver.executeScript(`
      localStorage.setItem('visitorToken', arguments[0]);
    `, visitorToken);

    // Set user token (for authenticated access)
    // For survey creation, we need a user token
    // In a real scenario, this would be obtained via magic link authentication
    const tokenToUse = userToken || E2E_CONFIG.testUserToken || 'test-user-token-' + Date.now();
    await driver.executeScript(`
      localStorage.setItem('userToken', arguments[0]);
    `, tokenToUse);

    // Also set cookies for compatibility
    await driver.manage().addCookie({ name: 'visitorToken', value: visitorToken });
    await driver.manage().addCookie({ name: 'userToken', value: tokenToUse });

    // Refresh the page to apply authentication
    await driver.get(E2E_CONFIG.baseUrl);
    await driver.sleep(1000); // Wait for page to recognize authentication
    
    // Verify we're not redirected to signin
    const currentUrl = await driver.getCurrentUrl();
    if (currentUrl.includes('/signin')) {
      throw new Error('Authentication failed - redirected to signin page');
    }
  } catch (error) {
    console.warn('Authentication setup failed:', error);
    throw error;
  }
}
