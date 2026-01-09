# Fix: Separate UserSession and VisitorSession Tokens

## Problem Summary

The app uses a **single token storage** (`localStorage["t"]` + `cookie["token"]`) for two different session types:

- **UserSession**: For authenticated users (magic link login) - used by `GetUser`, `ChangeSurveySchedule`, etc.
- **VisitorSession**: For anonymous visitors - used by `CreateSurveyFromQuery`, `CreateSurveyFromBrand`, `StartSurvey`, etc.

When a logged-in user triggers a VisitorSession-required endpoint, the 401 retry logic overwrites the UserSession token with a new VisitorSession token, breaking all subsequent authenticated calls.

---

## Files to Modify

### 1. `src/app/utils/token.ts`

**Current**: Single token storage with `get()`, `set()`, `clear()`

**Change to**: Dual token storage

```typescript
// Keys
const USER_TOKEN_KEY = "userToken";      // For UserSession (authenticated)
const VISITOR_TOKEN_KEY = "visitorToken"; // For VisitorSession (anonymous)
const LEGACY_TOKEN_KEY = "t";             // For migration

// New API
token.getUser()        // Get UserSession token
token.setUser(token)   // Set UserSession token
token.clearUser()      // Clear UserSession token

token.getVisitor()     // Get VisitorSession token
token.setVisitor(token)// Set VisitorSession token
token.clearVisitor()   // Clear VisitorSession token

token.get()            // Get active token (user if exists, else visitor) - for backwards compat
token.clear()          // Clear both tokens
```

Also update cookies: `userToken` and `visitorToken` instead of single `token`.

---

### 2. `src/app/lib/api.ts`

**Current**: Request interceptor adds single token to headers

**Change to**: Add endpoint-based token selection in the interceptor

```typescript
// Determine which token to use based on endpoint type
const url = config.url || "";

// Endpoints that require VisitorSession (anonymous) - these need visitor token
const isVisitorEndpoint =
url.includes("CreateSurveyFromQuery") ||
url.includes("CreateSurveyFromBrand") ||
url.includes("StartSurvey") ||
url.includes("GenerateQuestionsFromQuery") ||
url.includes("GenerateQuestionsFromBrand");

// Select the appropriate token
let authToken: string | null;
if (isVisitorEndpoint) {
// Visitor endpoints MUST use visitor token
authToken = token.getVisitor();
} else {
// All other endpoints: prefer user token, fall back to visitor
authToken = token.getUser() || token.getVisitor();
}
```

---

### 3. `src/app/services/onboardingService.ts`

**Current**: `createOnboardingSession()` calls `token.set()` which overwrites any existing token

**Change to**: Use `token.setVisitor()` instead of `token.set()`

```typescript
// Before
token.set(tokenValue.trim());

// After
token.setVisitor(tokenValue.trim());
```

---

### 4. `src/features/auth/services/authService.ts`

**Current**: `consumeMagicLink()` stores the UserSession token via `token.set()`

**Change to**: Use `token.setUser()` instead

```typescript
// Before
token.set(response);

// After
token.setUser(response);
```

---

### 5. `src/features/brand-rank/services/brandService.ts`

**Current**: 401 retry logic calls `createOnboardingSession()` which overwrites UserSession

**Change to**:
- Remove the 401 retry logic that creates visitor sessions (or make it smarter)
- Ensure visitor token is used for visitor-required endpoints
- Don't overwrite user token when creating visitor session

The `fetchQueryQuestions` and `fetchBrandQuestions` functions should:
1. Check if visitor token exists
2. If not, create one (without affecting user token)
3. Make the API call with visitor token

---

### 6. `src/features/auth/context/UserContext.tsx`

**Current**: Uses `token.get()` to check if user is logged in

**Change to**: Use `token.getUser()` for user-related checks

```typescript
// Check for user token specifically
const hasUserToken = !!token.getUser();
```

---

### 7. `src/features/auth/components/ProtectedRoute.tsx`

**Current**: Uses `token.get()` to check authentication

**Change to**: Use `token.getUser()` - only UserSession tokens should grant access to protected routes

---

### 8. `src/app/utils/Hub.tsx`

**Current**: Single `AuthTokenChanged` event

**Change to**: Consider separate events or single event with type info

```typescript
HubType.UserTokenChanged
HubType.VisitorTokenChanged
// OR
HubType.AuthTokenChanged // with payload { type: 'user' | 'visitor', token: string }
```

---

## Backend Context (No Changes Needed)

The backend already has the dual-session architecture:
- `HelperController.cs`: `visitorAuthNeeded` parameter
- `CreateSurveyFromQuery.cs`: `authNeeded: false, visitorAuthNeeded: true`
- `GetUser.cs`: `authNeeded: true` (default)
- Backend reads token from `Headers["token"]` or `Cookies["token"]`

If you want to send both tokens, backend would need minor update to read from specific headers, but current setup works if frontend sends the right token.

---

## Migration Strategy

1. On app load, check for legacy token in `localStorage["t"]`
2. If found and user is on authenticated route, migrate to `userToken`
3. If found and user is on public route, migrate to `visitorToken`
4. Clear legacy `"t"` key after migration

---

## Key Files Quick Reference

| File | What to change |
|------|----------------|
| `src/app/utils/token.ts` | Add dual token storage (user + visitor) |
| `src/app/lib/api.ts` | Update interceptor to use correct token |
| `src/app/services/onboardingService.ts` | Use `setVisitor()` instead of `set()` |
| `src/features/auth/services/authService.ts` | Use `setUser()` for magic link token |
| `src/features/brand-rank/services/brandService.ts` | Fix 401 retry logic, use visitor token |
| `src/features/auth/context/UserContext.tsx` | Use `getUser()` for auth checks |
| `src/features/auth/components/ProtectedRoute.tsx` | Use `getUser()` for route protection |

---

## Testing Checklist

- [ ] Fresh visitor can create surveys (visitor token)
- [ ] User can log in via magic link (user token stored)
- [ ] Logged-in user can create surveys (visitor token created separately)
- [ ] Logged-in user can switch projects (user token preserved)
- [ ] GetUser works after creating surveys
- [ ] Logout clears user token but can preserve visitor token
- [ ] Page refresh maintains correct session state


---
## Future Improvements / Technical Debt

### Issue: Logged-in users still require visitor tokens for survey endpoints

**Current State:**
Even after this fix, authenticated users need both a `userToken` AND a `visitorToken` to create surveys. This is because endpoints like `CreateSurveyFromBrand` and `CreateSurveyFromQuery` are configured with `visitorAuthNeeded: true` on the backend, meaning they only accept visitor session tokens.

**Why this is problematic:**
1. Confusing architecture - why would a logged-in user need an "anonymous" token?
2. Extra complexity in frontend token management
3. Potential for bugs when tokens get out of sync
4. Poor separation of concerns

**Recommended Backend Fix:**
Modify survey creation endpoints to accept EITHER a valid `UserSession` token OR a `VisitorSession` token. The backend should:
1. Check for `UserSession` first (authenticated user)
2. Fall back to `VisitorSession` if no user token (anonymous visitor)
3. Associate the created survey with the user if authenticated

**Tickets to create:**
- [ ] Backend: Update `CreateSurveyFromBrand` to accept UserSession tokens
- [ ] Backend: Update `CreateSurveyFromQuery` to accept UserSession tokens
- [ ] Backend: Update `StartSurvey` to accept UserSession tokens
- [ ] Frontend: Simplify token logic once backend supports both token types