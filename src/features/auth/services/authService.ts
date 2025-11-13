import { fetchApi } from "../../../app/lib/ApiClient";
import { getSelectedLanguage } from "../../../app/localization/language";

export const sendMagicLink = async (email: string) => {
  try {
    const res = await fetchApi.post(`/api/CreateMagicLink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: email,
        Locale: getSelectedLanguage().locale,
        // VisitorSessionToken: visitorSessionToken,
      }),
    });

    return res;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }

    console.error("Failed to search brands:", error);
    throw new Error("Unable to search brands. Please try again.");
  }
};
