import { WebDriver } from 'selenium-webdriver';
import { createDriver, quitDriver } from '../utils/driver';
import { navigateTo, waitForElementVisible, typeText, takeScreenshot, clearStorage } from '../utils/helpers';
import { E2E_CONFIG } from '../config';

describe('Authentication E2E Tests', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await createDriver();
  });

  afterAll(async () => {
    await quitDriver();
  });

  beforeEach(async () => {
    // Clear cookies and storage safely (handles data: URLs)
    await clearStorage(driver);
  });

  test('should display signin page correctly', async () => {
    try {
      await navigateTo(driver, '/signin');
      
      // Wait for email input field
      await waitForElementVisible(driver, 'input[type="email"]');
      
      // Check if "Sign up or log In to NetRanks" text is present
      const pageText = await driver.getPageSource();
      expect(pageText).toContain('Sign up or log In to NetRanks');
      
      // Check if email input placeholder is correct
      const emailInput = await driver.findElement({ css: 'input[type="email"]' });
      const placeholder = await emailInput.getAttribute('placeholder');
      expect(placeholder).toContain('name@gmail.com');
      
    } catch (error) {
      await takeScreenshot(driver, 'auth-signin-page-error');
      throw error;
    }
  });

  test('should submit magic link request', async () => {
    try {
      await navigateTo(driver, '/signin');
      
      // Wait for email input
      await waitForElementVisible(driver, 'input[type="email"]');
      
      // Enter email
      await typeText(driver, 'input[type="email"]', E2E_CONFIG.testUser.email);
      
      // Click send magic link button
      const buttonText = 'Send Magic Link';
      const button = await driver.findElement(
        { xpath: `//button[contains(text(), '${buttonText}')]` }
      );
      await button.click();
      
      // Wait for navigation to magic-link-sent page or success message
      // Note: In a real scenario, you might need to wait for toast notification
      // or check for navigation to /magic-link-sent
      await driver.sleep(2000); // Wait for async operations
      
      // Check if we're redirected or if success message appears
      const currentUrl = await driver.getCurrentUrl();
      const pageSource = await driver.getPageSource();
      
      // Either redirected to magic-link-sent or success toast appears
      expect(
        currentUrl.includes('/magic-link-sent') || 
        pageSource.includes('Magic link sent') ||
        pageSource.includes('Success')
      ).toBe(true);
      
    } catch (error) {
      await takeScreenshot(driver, 'auth-magic-link-submit-error');
      throw error;
    }
  });

  test('should validate email input', async () => {
    try {
      await navigateTo(driver, '/signin');
      
      // Wait for email input
      await waitForElementVisible(driver, 'input[type="email"]');
      
      // Try to submit without email
      const button = await driver.findElement(
        { xpath: "//button[contains(text(), 'Send Magic Link')]" }
      );
      const isEnabled = await button.isEnabled();
      
      // Button should be disabled when email is empty
      expect(isEnabled).toBe(false);
      
      // Enter invalid email
      await typeText(driver, 'input[type="email"]', 'invalid-email');
      
      // Button might still be disabled or form validation might prevent submission
      // Check HTML5 validation
      const emailInput = await driver.findElement({ css: 'input[type="email"]' });
      const validity = await driver.executeScript(
        'return arguments[0].validity.valid;',
        emailInput
      );
      
      expect(validity).toBe(false);
      
    } catch (error) {
      await takeScreenshot(driver, 'auth-email-validation-error');
      throw error;
    }
  });
});
