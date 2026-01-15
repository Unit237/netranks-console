import { apiClient, ApiError } from "../../../app/lib/api";
import { getSelectedLanguage } from "../../../app/localization/language";
import AuthManager from "../../../app/auth/AuthManager";
import type { UserData } from "../@types";

export const sendMagicLink = async (
  email: string,
  visitorSessionToken: string
) => {
  try {
    const res = await apiClient.post(`api/CreateMagicLink`, {
      Email: email,
      Locale: getSelectedLanguage().locale,
      VisitorSessionToken: visitorSessionToken,
    });

    return res;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is (it already has proper error handling)
    if (error instanceof ApiError) {
      throw error;
    }

    // Convert unknown errors to ApiError
    console.error("Failed to authenticate:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to authenticate, please try again"
    );
  }
};

export const consumeMagicLink = async (
  magicLinkId?: string,
  p1?: string,
  p2?: string
) => {
  try {
    // Use apiClient with skipErrorToast to handle 401/403 manually
    const res = await apiClient.get<string>(
      `api/ConsumeMagicLink/${magicLinkId}/${p1}/${p2}`,
      { skipErrorToast: true }
    );

    // Set token if we got a successful response
    if (typeof res === "string") {
      AuthManager.setUserToken(res);
      return res;
    } else {
      throw new ApiError("Invalid response format");
    }
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Convert unknown errors to ApiError
    console.error("Failed to authenticate:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to authenticate, please try again"
    );
  }
};

export const getUser = async () => {
  // Dev mode: Use mock data for testing Last Run functionality
  // Set VITE_USE_MOCK_USER_DATA=true in .env to enable
  if (import.meta.env.VITE_USE_MOCK_USER_DATA === "true") {
    const { DUMMY_USER } = await import("../../../app/utils/constant");
    console.log("[DEV MODE] Using mock user data for testing");
    return DUMMY_USER;
  }

  try {
    const res: UserData | string = await apiClient.get(`api/GetUser`);

    // Validate response structure - check if response is HTML (error page)
    if (typeof res === "string") {
      if (res.trim().startsWith("<!DOCTYPE") || res.trim().startsWith("<html")) {
        console.error("Received HTML instead of JSON:", res.substring(0, 200));
        throw new ApiError("Server returned an error page instead of user data");
      }
      // Try to parse as JSON if it's a string
      try {
        const parsed = JSON.parse(res);
        if (!parsed || typeof parsed !== "object") {
          throw new ApiError("Invalid user data format received from server");
        }
        return parsed as UserData;
      } catch (parseError) {
        throw new ApiError("Failed to parse user data response");
      }
    }

    // Validate response structure
    if (!res || typeof res !== "object") {
      console.error("Invalid user data received:", res);
      throw new ApiError("Invalid user data format received from server");
    }

    // Ensure Projects is an array (even if empty)
    if (res.Projects && !Array.isArray(res.Projects)) {
      if (import.meta.env.DEV) {
        console.warn("User Projects is not an array, converting to empty array");
      }
      res.Projects = [];
    } else if (!res.Projects) {
      res.Projects = [];
    }

    return res;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is (it already has proper error handling)
    if (error instanceof ApiError) {
      throw error;
    }

    // Convert unknown errors to ApiError
    console.error("Failed to get user:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to get user, please try again"
    );
  }
};
