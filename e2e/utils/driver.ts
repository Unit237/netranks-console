import { Builder, WebDriver } from "selenium-webdriver";
import chrome, { ServiceBuilder } from "selenium-webdriver/chrome";
import { E2E_CONFIG } from "../config";

let driver: WebDriver | null = null;

export async function createDriver(): Promise<WebDriver> {
  if (driver) {
    return driver;
  }

  const options = new chrome.Options();

  if (E2E_CONFIG.headless) {
    options.addArguments("--headless");
  }

  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1920,1080");

  // Configure ChromeDriver service
  // The chromedriver package exports the path to the binary
  let service: ServiceBuilder | undefined;

  try {
    const chromedriver = require("chromedriver");
    const chromedriverPath =
      typeof chromedriver === "string"
        ? chromedriver
        : chromedriver?.path || chromedriver;

    if (chromedriverPath) {
      service = new ServiceBuilder(chromedriverPath);
    }
  } catch (error) {
    // If chromedriver package is not found, Selenium will try to find it in PATH
    console.warn("ChromeDriver path not found, Selenium will use system PATH");
  }

  const builder = new Builder().forBrowser("chrome").setChromeOptions(options);

  if (service) {
    builder.setChromeService(service);
  }

  driver = await builder.build();

  // Set timeouts
  await driver.manage().setTimeouts({
    implicit: E2E_CONFIG.implicitWait,
    pageLoad: E2E_CONFIG.pageLoadTimeout,
  });

  return driver;
}

export async function quitDriver(): Promise<void> {
  if (driver) {
    await driver.quit();
    driver = null;
  }
}

export function getDriver(): WebDriver {
  if (!driver) {
    throw new Error("Driver not initialized. Call createDriver() first.");
  }
  return driver;
}
