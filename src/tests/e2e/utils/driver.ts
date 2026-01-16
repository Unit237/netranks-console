import { Browser, BrowserContext, Page, chromium } from "playwright";
import { E2E_CONFIG } from "../config";

let browser: Browser | null = null;
let context: BrowserContext | null = null;
let page: Page | null = null;

export async function createBrowser(): Promise<Browser> {
  if (browser) {
    return browser;
  }

  browser = await chromium.launch({
    headless: E2E_CONFIG.headless,
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  return browser;
}

export async function createContext(): Promise<BrowserContext> {
  if (context) {
    return context;
  }

  const browserInstance = await createBrowser();
  
  context = await browserInstance.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  // Set default timeouts
  context.setDefaultTimeout(E2E_CONFIG.defaultTimeout);
  context.setDefaultNavigationTimeout(E2E_CONFIG.pageLoadTimeout);

  return context;
}

export async function getPage(): Promise<Page> {
  if (page) {
    return page;
  }

  const contextInstance = await createContext();
  page = await contextInstance.newPage();
  
  return page;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
    context = null;
    page = null;
  }
}

export async function closeContext(): Promise<void> {
  if (context) {
    await context.close();
    context = null;
    page = null;
  }
}

export async function closePage(): Promise<void> {
  if (page) {
    await page.close();
    page = null;
  }
}

// Legacy compatibility functions
export async function createDriver(): Promise<Page> {
  return await getPage();
}

export async function quitDriver(): Promise<void> {
  await closeBrowser();
}

export function getDriver(): Page {
  if (!page) {
    throw new Error("Page not initialized. Call createDriver() first.");
  }
  return page;
}
