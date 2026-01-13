export const E2E_CONFIG = {
  // Base URL for the application
  baseUrl: process.env.E2E_BASE_URL || "http://localhost:5173",

  // Timeouts
  defaultTimeout: 30000, // 30 seconds
  pageLoadTimeout: 30000,
  implicitWait: 10000,

  // Test user credentials (should be set via environment variables)
  testUser: {
    email: process.env.E2E_TEST_EMAIL || "test@example.com",
  },

  // Test user token (for authenticated tests)
  // In a real scenario, this would be obtained via magic link authentication
  testUserToken:
    process.env.E2E_TEST_USER_TOKEN || "fa77fc95-3f25-4d42-8af3-55a4fd8c61d3",

  // Browser configuration
  browser: process.env.E2E_BROWSER || "chrome",
  headless: process.env.E2E_HEADLESS !== "false",

  // Screenshot settings
  screenshotOnFailure: true,
  screenshotDir: "./e2e/screenshots",
};
