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
  const isProduction = import.meta.env.VITE_PROD === "true";
  const existingToken = token.getVisitor();
  
  // In production, always try to create a fresh token to ensure it's valid
  // In dev, skip if token already exists (optional optimization)
  // if (!isProduction && existingToken) {
  //   return;
  // }

  try {
    if (import.meta.env.DEV || isProduction) {
      console.log("[Onboarding] Starting visitor session creation", {
        backend: prms.SERVER_URL,
        isProduction,
        hasExistingToken: !!existingToken,
        existingTokenPreview: existingToken ? existingToken.substring(0, 20) + "..." : null,
      });
    }

    // Step 1: Create visitor session and get IP/session identifier
    // This call doesn't need a token (authNeeded: false)
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
    // This call also doesn't need a token (authNeeded: false)
    const tokenValue = await apiClient.get<string>(
      urlParams("api/CreateVisitorSession", { secret })
    );
    
    if (import.meta.env.DEV || isProduction) {
      console.log("[Onboarding] Received token from backend", {
        tokenLength: tokenValue?.length,
        tokenPreview: tokenValue ? tokenValue.substring(0, 20) + "..." : null,
        backend: prms.SERVER_URL,
      });
    }

    // Step 4: Store token if received
    // Validate token is a valid Guid format (backend-main expects Guid)
    if (tokenValue && typeof tokenValue === "string") {
      // Basic Guid validation: should be in format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (guidPattern.test(tokenValue.trim())) {
        token.setVisitor(tokenValue.trim());
        if (import.meta.env.DEV) {
          console.log("[Onboarding] Visitor session token created and stored", {
            backend: prms.SERVER_URL,
          });
        }
      } else {
        console.error("[Onboarding] Invalid token format (not a valid Guid)", {
          tokenValue: tokenValue.substring(0, 50),
        });
      }
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
