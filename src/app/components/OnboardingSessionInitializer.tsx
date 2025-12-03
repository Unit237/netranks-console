import { useEffect } from "react";
import { createOnboardingSession } from "../services/onboardingService";

/**
 * Standalone component that initializes the onboarding session on mount.
 *
 * This component handles visitor session creation for users who don't have
 * a token yet. It runs automatically when mounted and doesn't render any UI.
 *
 * Features:
 * - Non-blocking: Errors don't prevent app from rendering
 * - Fire-and-forget: Runs once on mount
 * - Silent operation: No UI feedback needed
 *
 * @example
 * ```tsx
 * <OnboardingSessionInitializer />
 * ```
 */
export default function OnboardingSessionInitializer() {
  useEffect(() => {
    // Initialize onboarding session on mount
    // This is fire-and-forget - errors are handled internally
    // and won't block app rendering
    createOnboardingSession().catch((error) => {
      // Extra safety net - should never happen due to internal error handling
      // but ensures app continues to render even if something unexpected occurs
      console.error("[OnboardingSessionInitializer] Unexpected error:", error);
    });
  }, []);

  // This component doesn't render anything
  return null;
}

