import { apiClient, ApiError } from "../../../app/lib/api";
import type { SurveyStatsResponse } from "../@types";

export const getSurveyRunForDashboard = async (
  surveyRunId?: string,
  p1?: string,
  p2?: string
) => {
  try {
    const surveyRun: SurveyStatsResponse = await apiClient.get(
      `api/GetSurveyRunDashboard/${surveyRunId}/${p1}/${p2}`
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

    console.error("Failed to get survey run:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to get survey run. Please try again."
    );
  }
};
