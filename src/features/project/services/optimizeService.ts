import { apiClient, ApiError } from "../../../app/lib/api";
import prms from "../../../app/shared/utils/prms";
import type { PredictionData } from "../../prediction/refactor/Brand";
import type { SurveyDetails } from "../@types";
import type {
  CreateSearchPayload,
  FilterResponse,
} from "../@types/optimization";

export const getDashboardFilterFields = async (surveyId: number) => {
  try {
    const surveyRun: FilterResponse = await apiClient.get(
      `api/GetDashboardFilterFields/${surveyId}`
    );

    return surveyRun;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to schedule survey:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to schedule survey. Please try again."
    );
  }
};

export const getSurveyDashboard = async (
  surveyId: number,
  filterDto?: CreateSearchPayload
) => {
  try {
    if (filterDto) {
      const res: SurveyDetails = await apiClient.post(
        `api/GetSurveyDashboard/${surveyId}`,
        filterDto
      );

      return res;
    } else {
      const surveyRun: FilterResponse = await apiClient.get(
        `api/GetSurveyDashboard/${surveyId}`
      );
      return surveyRun;
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

    console.error("Failed to schedule survey:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to schedule survey. Please try again."
    );
  }
};

export const getPrediction = async (
  brandName: string,
  url: string,
  questionText: string
): Promise<PredictionData> => {
  try {
    const predictionPromise = fetch(`${prms.API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: questionText,
        suggest_name: brandName,
        description: brandName,
        url_title: brandName,
        url: url,
        survey_description: "",
        description_short: "",
        explain: false,
        detail_level: "standard",
      }),
    });

    // Content Attribution API call (only if we have required fields)
    const attributionPromise =
      url && questionText
        ? fetch(`${prms.API_BASE_URL}/analyze-segments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question_text: questionText,
              suggest_name: brandName,
              url_title: brandName,
              url: url,
            }),
          })
        : Promise.resolve(null);

    const [predictionResponse, attributionResponse] = await Promise.allSettled([
      predictionPromise,
      attributionPromise,
    ]);

    // Handle prediction response
    if (predictionResponse.status === "rejected") {
      throw new Error("Failed to fetch prediction");
    }

    const predictionPromiseResponse = predictionResponse.value;
    if (!predictionPromiseResponse.ok) {
      const errorText = await predictionPromiseResponse.text();
      let errorMessage = "Failed to fetch prediction";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result = await predictionPromiseResponse.json();

    // Validate response structure
    if (!result || typeof result !== "object") {
      throw new Error("Invalid response format from server");
    }

    // Ensure prediction object exists with safe defaults
    if (!result.prediction) {
      result.prediction = {
        predicted_rank: null,
        current_rank: null,
        improvement: null,
        uncertainty: null,
      };
    }

    // Handle attribution response (optional)
    let attributionResult = null;
    if (
      attributionResponse.status === "fulfilled" &&
      attributionResponse.value
    ) {
      const attributionPromiseResponse = attributionResponse.value;
      if (attributionPromiseResponse && attributionPromiseResponse.ok) {
        attributionResult = await attributionPromiseResponse.json();
      }
    }

    return {
      prediction: result.prediction,
      enhanced: result.enhanced || null,
      suggestions: result.suggestions || null,
      attribution: attributionResult,
    };
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to schedule survey:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to schedule survey. Please try again."
    );
  }
};
