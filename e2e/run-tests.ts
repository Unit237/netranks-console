import { E2E_CONFIG } from "./config";
import { createDriver, quitDriver } from "./utils/driver";

// Import test files
import "./tests/auth.test";
import "./tests/survey-creation.test";
import "./tests/survey-details.test";

async function runTests() {
  console.log("Starting E2E tests...");
  console.log(`Base URL: ${E2E_CONFIG.baseUrl}`);
  console.log(`Browser: ${E2E_CONFIG.browser}`);
  console.log(`Headless: ${E2E_CONFIG.headless}`);

  try {
    // Create driver before tests
    await createDriver();

    console.log("E2E tests completed");
  } catch (error) {
    console.error("E2E tests failed:", error);
    process.exit(1);
  } finally {
    await quitDriver();
  }
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests };
