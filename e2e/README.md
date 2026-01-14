# End-to-End Testing with Playwright

This directory contains E2E tests using Playwright.

## Prerequisites

1. **Node.js**: Ensure Node.js is installed
2. **Playwright Browsers**: Automatically installed when you run `npx playwright install`
3. **Application Running**: The application should be running on `http://localhost:5173` (or set `E2E_BASE_URL` environment variable)

## Installation

After installing dependencies, install Playwright browsers:

```bash
npm install
npx playwright install chromium
```

## Configuration

Tests are configured via `playwright.config.ts`. You can override settings using environment variables:

- `E2E_BASE_URL`: Base URL for the application (default: `http://localhost:5173`)
- `E2E_TEST_EMAIL`: Test user email for authentication tests
- `E2E_TEST_USER_TOKEN`: Valid user token for authenticated tests (optional, will use mock token if not provided)

## Running Tests

### Run all E2E tests:

```bash
npm run test:e2e
```

### Run tests with UI mode (interactive):

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser):

```bash
npm run test:e2e:headed
```

### Run specific test file:

```bash
npx playwright test e2e/tests/auth.test.ts
```

### Run tests in debug mode:

```bash
npx playwright test --debug
```

## Test Structure

- `e2e/tests/`: Test files

  - `auth.test.ts`: Authentication flow tests
  - `survey-creation.test.ts`: Survey creation flow tests
  - `survey-details.test.ts`: Survey details page tests

- `e2e/utils/`: Utility functions

  - `driver.ts`: Playwright browser/page setup and teardown
  - `helpers.ts`: Helper functions for common Playwright operations

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

## Troubleshooting

### Tests timing out

Increase timeout in `playwright.config.ts` or use `test.setTimeout()` in your test file.

### Element not found errors

- Check if the application is running
- Verify selectors are correct
- Use Playwright's auto-waiting (it's automatic)
- Check screenshots in `test-results/` directory
- Use `npx playwright show-trace` to debug

### Browser not found

Run `npx playwright install` to install browsers.

### View test results

After running tests, open the HTML report:

```bash
npx playwright show-report
```
