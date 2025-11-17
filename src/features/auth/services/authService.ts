import { fetchApi, SERVER_URL } from "../../../app/lib/ApiClient";
import { getSelectedLanguage } from "../../../app/localization/language";
import token from "../../../app/utils/token";
import type { UserData } from "../@types";

export const sendMagicLink = async (
  email: string,
  visitorSessionToken: string
) => {
  try {
    const res = await fetchApi.post(`api/CreateMagicLink`, {
      Email: email,
      Locale: getSelectedLanguage().locale,
      VisitorSessionToken: visitorSessionToken,
    });

    return res;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }

    console.error("Failed to authenticate:", error);
    throw new Error("Unable to authenticate, please try again");
  }
};

export const consumeMagicLink = async (
  magicLinkId?: string,
  p1?: string,
  p2?: string
) => {
  try {
    // Use direct fetch to avoid ApiClient's automatic redirect on 401/403
    const url = `${SERVER_URL}api/ConsumeMagicLink/${magicLinkId}/${p1}/${p2}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let responseBody: string | null = null;
    let data: unknown = null;

    if (response.status !== 204) {
      responseBody = await response.text();
      if (responseBody) {
        try {
          data = JSON.parse(responseBody);
        } catch {
          data = responseBody;
        }
      }
    }

    if (!response.ok) {
      const error = new Error(
        `HTTP Error: ${response.status} ${response.statusText}`
      );
      (error as Error & { data?: unknown; response?: Response }).data = data;
      (error as Error & { data?: unknown; response?: Response }).response =
        response;
      throw error;
    }

    console.log(data);

    // Set token if we got a successful response
    if (typeof data === "string") {
      token.set(data);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }

    console.error("Failed to authenticate:", error);

    // Preserve the original error if it has useful information
    if (error instanceof Error) {
      // Check if error has response/data that we want to preserve
      const errorWithData = error as Error & {
        data?: unknown;
        response?: Response;
      };
      if (errorWithData.response || errorWithData.data) {
        // Create a new error that preserves the original error's properties
        const enhancedError = new Error(
          error.message || "Unable to authenticate, please try again"
        );
        (
          enhancedError as Error & { data?: unknown; response?: Response }
        ).data = errorWithData.data;
        (
          enhancedError as Error & { data?: unknown; response?: Response }
        ).response = errorWithData.response;
        throw enhancedError;
      }
      throw error;
    }

    throw new Error("Unable to authenticate, please try again");
  }
};

export const getUser = async () => {
  try {
    const res: UserData = await fetchApi.get(`api/GetUser`);

    console.log(res);

    return res;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }

    console.error("Failed to authenticate:", error);
    throw new Error("Unable to authenticate, please try again");
  }
};
