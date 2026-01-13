# End-to-End Testing with Selenium

This directory contains E2E tests using Selenium WebDriver and Jest.

## Prerequisites

1. **Chrome Browser**: Ensure Chrome is installed on your system
2. **ChromeDriver**: Automatically installed via npm package `chromedriver`
3. **Application Running**: The application should be running on `http://localhost:5173` (or set `E2E_BASE_URL` environment variable)

## Configuration

Tests are configured via `e2e/config.ts`. You can override settings using environment variables:

- `E2E_BASE_URL`: Base URL for the application (default: `http://localhost:5173`)
- `E2E_BROWSER`: Browser to use (default: `chrome`)
- `E2E_HEADLESS`: Run in headless mode (default: `true`, set to `false` to see browser)
- `E2E_TEST_EMAIL`: Test user email for authentication tests
- `E2E_TEST_USER_TOKEN`: Valid user token for authenticated tests (optional, will use mock token if not provided)

## Running Tests

### Run all E2E tests:
```bash
npm run test:e2e
```

### Run specific test file:
```bash
npx jest --config jest.e2e.config.cjs e2e/tests/auth.test.ts
```

### Run tests in watch mode:
```bash
npx jest --config jest.e2e.config.cjs --watch
```

### Run tests with visible browser (non-headless):
```bash
E2E_HEADLESS=false npm run test:e2e
```

## Test Structure

- `e2e/tests/`: Test files
  - `auth.test.ts`: Authentication flow tests
  - `survey-creation.test.ts`: Survey creation flow tests
  - `survey-details.test.ts`: Survey details page tests

- `e2e/utils/`: Utility functions
  - `driver.ts`: WebDriver setup and teardown
  - `helpers.ts`: Helper functions for common Selenium operations

- `e2e/config.ts`: Configuration settings

- `e2e/screenshots/`: Screenshots saved on test failures (auto-created)

## Authentication

Tests that require authentication (like survey creation) automatically authenticate before running:

- **Visitor Token**: Created automatically for anonymous access
- **User Token**: Set from `E2E_TEST_USER_TOKEN` environment variable, or uses a mock token

To use a real user token:
1. Authenticate manually in the app (via magic link)
2. Copy the `userToken` from browser localStorage
3. Set it as environment variable: `export E2E_TEST_USER_TOKEN="your-token-here"`
4. Run tests: `npm run test:e2e`

**Note**: Mock tokens work for UI tests but won't work for API calls that validate tokens. For full E2E tests with real API calls, use a valid user token.

## Writing New Tests

1. Create a new test file in `e2e/tests/`
2. Import necessary utilities:
   ```typescript
   import { createDriver, quitDriver } from '../utils/driver';
   import { navigateTo, waitForElementVisible, typeText, clickElement, authenticate } from '../utils/helpers';
   ```
3. Authenticate in `beforeAll` or `beforeEach` if needed:
   ```typescript
   beforeAll(async () => {
     driver = await createDriver();
     await authenticate(driver); // Sets visitorToken and userToken
   });
   ```
4. Use Jest's `describe` and `test` blocks
5. Use helper functions for common operations

## Troubleshooting

### ChromeDriver version mismatch
If you encounter ChromeDriver version issues:

1. **Check your Chrome version:**
   ```bash
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --version
   ```

2. **Install matching ChromeDriver:**
   ```bash
   npm install --save-dev chromedriver@<version>
   ```
   Replace `<version>` with a ChromeDriver version that matches your Chrome browser version.
   
   **Note:** ChromeDriver versions may not exactly match Chrome versions. Check available versions at:
   https://chromedriver.chromium.org/downloads
   
   Or use Chrome for Testing versions:
   https://googlechromelabs.github.io/chrome-for-testing/

3. **Alternative: Use ChromeDriverManager (auto-downloads correct version)**
   You can also manually download ChromeDriver and add it to your PATH, or use a tool that auto-manages ChromeDriver versions.

### Tests timing out
Increase timeout in `e2e/config.ts` or use `jest.setTimeout()` in your test file.

### Element not found errors
- Check if the application is running
- Verify selectors are correct
- Increase wait timeouts
- Check screenshots in `e2e/screenshots/` directory
