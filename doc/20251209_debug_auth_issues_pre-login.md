# Authentication Debugging Guide - NetRanks

## Issues Fixed (2025-12-09)

### Issue 1: Double API Calls on Page Load
**Commit**: `0cc45f9`

**Problem**: `CreateVisitorSession` was called twice on page load, creating two different tokens. The second token overwrote the first, but in-flight requests used the old token.

**Cause**: React 19 StrictMode runs effects twice in development mode.

**Fix**: Disabled StrictMode in `src/main.tsx`.

> Note: If StrictMode needs to stay enabled, add request deduplication in `OnboardingSessionInitializer.tsx` or `onboardingService.ts`.

---

### Issue 2: Typos in Response Handling
**Commit**: `caace22`

**Problem**: Typos in `brandService.ts` caused response parsing issues.

**Fix**: Fixed the typos. These should ideally be caught by TypeScript.

---

### Issue 3: StartSurvey Returning 401 Unauthorized
**Commit**: `5e8c78f`

**Problem**: `GET /api/StartSurvey/0` always returned 401.

**Cause**: `brandService.ts` was hardcoding `Id: 0` instead of using the API response:

```typescript
// Before (broken)
const brandData: BrandData = {
  Id: 0,  // Always 0, ignoring response.Id
  PasswordOne: null,
  ...
};
```

**Fix**: Use API response values with fallbacks:

```typescript
// After (fixed)
const brandData: BrandData = {
  Id: response?.Id ?? 0,
  PasswordOne: response?.PasswordOne ?? null,
  ...
};
```

**Files Changed**: `src/features/brand-rank/services/brandService.ts` (both `fetchBrandQuestions` and `fetchQueryQuestions`)

---

## Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | App entry, StrictMode config |
| `src/features/brand-rank/services/brandService.ts` | Survey API calls |
| `src/app/services/onboardingService.ts` | Visitor session creation |
| `src/app/utils/token.ts` | Token storage (localStorage + cookies) |

---

- **Token Storage**: Dual storage in `localStorage["t"]` and `cookie["token"]` still exists, but since double fetch is gone, they are more likely to be consistent. 
---

*Last Updated: 2025-12-09*
