import { apiClient, ApiError } from "../../../app/lib/api";
import { getSelectedLanguage } from "../../../app/localization/language";
import token from "../../../app/utils/token";
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
      token.set(res);
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
  try {
    const res: UserData = await apiClient.get(`api/GetUser`);

    // const res = DUMMY_USER;

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
