import { apiClient, ApiError } from "../../../app/lib/api";
import prms from "../../../app/shared/utils/prms";
import type { PredictionData } from "../../prediction/refactor/Brand";
import type { Dashboard } from "../@types";
import type {
  CreateSearchPayload,
  FilterResponse,
} from "../@types/optimization";
import type { RankingAnalysisResponse } from "../@types/prediction";

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

export const getSurveyDashboard = async (surveyId: number) => {
  try {
    const surveyRun: FilterResponse = await apiClient.get(
      `api/GetSurveyDashboard/${surveyId}`
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

export const getSurveyMainDashboard = async (
  surveyId: number,
  filterDto?: CreateSearchPayload
) => {
  try {
    const res: Dashboard = await apiClient.post(
      `api/GetSurveyDashboard/${surveyId}`,
      filterDto
    );

    return res;
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

export interface BatchPredictionItem {
  question_text: string;
  suggest_name: string;
  url_title: string;
  url: string;
  current_rank?: number;
  model_name?: string;
}

export interface BatchPredictionRequest {
  items: BatchPredictionItem[];
}

export const getBatchPrediction = async (
  brandName: string,
  url: string,
  questions: Array<{ Id: number; Text: string }>
): Promise<RankingAnalysisResponse> => {
  try {
    // Normalize URL to ensure it has a protocol
    const normalizeUrl = (url: string): string => {
      if (!url || typeof url !== "string") return url;
      const trimmed = url.trim();
      if (!trimmed) return trimmed;
      
      // If URL already has protocol, return as-is
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        return trimmed;
      }
      
      // Otherwise, add https://
      return `https://${trimmed}`;
    };

    const normalizedUrl = normalizeUrl(url);

    if (import.meta.env.DEV && url !== normalizedUrl) {
      console.log("🔧 URL normalized:", { original: url, normalized: normalizedUrl });
    }

    // Build the items array for batch request - sending ALL questions at once
    const items: BatchPredictionItem[] = questions.map((question) => ({
      question_text: question.Text,
      suggest_name: brandName,
      url_title: brandName,
      url: normalizedUrl,  // Use normalized URL
    }));

    const requestUrl = `${prms.API_BASE_URL}/predict/batch`;
    const requestBody = { items };

    if (import.meta.env.DEV) {
      console.log("Batch prediction request - sending ALL questions:", {
        url: requestUrl,
        totalQuestions: questions.length,
        itemCount: items.length,
        brandName,
        url,
        questionTexts: items.map((item, idx) => ({
          index: idx,
          question: item.question_text?.substring(0, 60) + "...",
        })),
      });
    }

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to fetch batch predictions";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      if (import.meta.env.DEV) {
        console.error("Batch prediction error:", {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorText,
        });
      }
      
      throw new Error(errorMessage);
    }

    const results: RankingAnalysisResponse = await response.json();

    if (import.meta.env.DEV) {
      console.log("Batch prediction response:", {
        success: results.success,
        totalItems: results.total_items,
        successfulPredictions: results.successful_predictions,
        failedPredictions: results.failed_predictions,
        resultsCount: results.results?.length || 0,
        errorsCount: results.errors?.length || 0,
      });
    }

    return results;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to fetch batch predictions:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to fetch batch predictions. Please try again."
    );
  }
};
