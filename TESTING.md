# Testing Guide

This project uses multiple testing frameworks:

- **Jest** for unit/integration tests (new tests)
- **Vitest** for existing unit tests (legacy tests)
- **Playwright** for end-to-end tests

## Test Types

### Unit/Integration Tests (Jest)

Located in `src/**/__tests__/**/*.test.ts` (excluding Vitest test files)

These tests cover:

- Utility functions
- Service functions
- Component logic (with React Testing Library)
- Integration between modules

**Note:** Some existing tests use Vitest. Run them separately with `npm run test:vitest`

### Unit/Integration Tests (Vitest)

Located in:

- `src/services/__tests__/mockMemberService.test.ts`
- `src/features/console/pages/__tests__/Members.test.tsx`
- `src/features/project/utils/__tests__/formatLastRun.test.ts`

Run with: `npm run test:vitest`

### End-to-End Tests (Playwright)

Located in `e2e/tests/**/*.test.ts`

These tests cover:

- Authentication flow
- Survey creation flow
- Survey details page interactions

## Running Tests

### Run all tests (unit + E2E):

```bash
npm run test:all
```

### Run only unit/integration tests:

```bash
npm run test
```

### Run tests in watch mode:

```bash
npm run test:watch
```

### Run tests with coverage:

```bash
npm run test:coverage
```

### Run only E2E tests:

```bash
npm run test:e2e
```

### Run Vitest tests (legacy):

```bash
npm run test:vitest
```

## Test Configuration

### Jest Configuration

- Main config: `jest.config.cjs` (CommonJS to avoid ES module conflicts)
- Setup file: `src/tests/jest-setup.ts`

### E2E Configuration

- Config file: `playwright.config.ts`
- Base URL: `http://localhost:5173` (or set `E2E_BASE_URL`)
- Browser: Chromium (headless by default)
- Additional scripts:
  - `test:e2e:ui` - Run tests with interactive UI
  - `test:e2e:headed` - Run tests with visible browser

## CI/CD Integration

Tests run automatically as part of the deployment process via `deploy.sh`. The deployment will fail if any tests fail.

To skip tests during deployment (not recommended):

```bash
# Comment out the test section in deploy.sh
```

## Environment Variables for E2E Tests

- `E2E_BASE_URL`: Application URL (default: `http://localhost:5173`)
- `E2E_TEST_EMAIL`: Test user email
- `E2E_TEST_USER_TOKEN`: Valid user token for authenticated tests (optional)

## Coverage Thresholds

Current coverage thresholds (in `jest.config.cjs`):

- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

These can be adjusted as needed.
