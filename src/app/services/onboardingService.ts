import CryptoJS from "crypto-js";
import { apiClient, ApiError } from "../lib/api";
import prms from "../utils/config";
import token from "../utils/token";
import { urlParams } from "../utils/urlUtils";

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
 * @returns Promise that resolves when onboarding is complete or skipped
 */
export async function createOnboardingSession(): Promise<void> {
  // Early return if token already exists
  // if (token.get()) {
  //   return;
  // }

  try {
    // Step 1: Create visitor session and get IP/session identifier
    const ip = await apiClient.get<string>(`api/CreateVisitorSession`);

    // Validate response
    if (!ip || typeof ip !== "string") {
      console.error(
        "[Onboarding] Failed to create visitor session: API returned invalid data",
        { ip }
      );
      return;
    }

    // Step 2: Encrypt the session identifier using AES-ECB
    const key = CryptoJS.lib.WordArray.create(
      prms.netranksSessionKey.words,
      prms.netranksSessionKey.sigBytes
    );

    const secret = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(ip), key, {
      mode: CryptoJS.mode.ECB,
    }).toString();

    // Step 3: Exchange encrypted secret for visitor token
    const tokenValue = await apiClient.get<string>(
      urlParams("api/CreateVisitorSession", { secret })
    );

    // Step 4: Store token if received
    if (tokenValue && typeof tokenValue === "string") {
      token.set(tokenValue);
    } else {
      if (import.meta.env.DEV) {
        console.warn(
          "[Onboarding] Received invalid token from CreateVisitorSession",
          { tokenValue }
        );
      }
    }
  } catch (error) {
    // Handle specific error types
    if (error instanceof ApiError) {
      // Don't log canceled requests (they're intentional)
      if (error.isCanceled) {
        return;
      }

      // Log API errors with context
      console.error(`[Onboarding] API error during session creation:`, {
        message: error.message,
        status: error.status,
        code: error.code,
      });
    } else {
      // Log unexpected errors
      console.error(
        "[Onboarding] Unexpected error during session creation:",
        error instanceof Error ? error.message : "Unknown error",
        error
      );
    }

    // Silently fail - don't block app initialization
    // The app can still function without a visitor session token
  }
}
