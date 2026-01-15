import AuthManager from "../auth/AuthManager";

// Singleton promise to prevent concurrent session creation (race condition fix)
let sessionCreationPromise: Promise<void> | null = null;

/**
 * Creates an onboarding session for visitors who don't have a token yet.
 * This function:
 * 1. Checks if a token already exists (if so, skips onboarding)
 * 2. Creates a visitor session with the backend
 * 3. Encrypts the session data using AES encryption
 * 4. Exchanges the encrypted secret for a visitor token
 *
 * This is a fire-and-forget operation that should not block app initialization.
 * Errors are logged but do not prevent the app from rendering.
 *
 * IMPORTANT: This function uses a singleton promise pattern to prevent race conditions
 * when multiple callers (e.g., OnboardingSessionInitializer and fetchQuestions)
 * try to create a session simultaneously.
 *
 * @returns Promise that resolves when onboarding is complete or skipped
 */
export async function createOnboardingSession(): Promise<void> {
  if (sessionCreationPromise) {
    return sessionCreationPromise;
  }

  sessionCreationPromise = AuthManager.ensureVisitorSession();
  try {
    await sessionCreationPromise;
  } finally {
    sessionCreationPromise = null;
  }
}
