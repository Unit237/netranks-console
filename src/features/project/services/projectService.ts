import { apiClient, ApiError } from "../../../app/lib/api";
import type { SurveyDetails } from "../@types";

export const changeSurveySchedule = async (
  surveyRunId: number,
  schedule: number
) => {
  try {
    const surveyRun = await apiClient.patch(
      `api/ChangeSurveySchedule/${surveyRunId}`,
      schedule
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

export const createSurvey = async (
  projectId: number,
  schedule: number,
  name: string,
  question: string[]
) => {
  try {
    const surveyRun = await apiClient.post(`api/CreateSurvey`, {
      ProjectId: projectId,
      SchedulePeriodHours: schedule,
      Name: name,
      Questions: question,
    });

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

    console.error("Failed to create survey:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to schedule survey. Please try again."
    );
  }
};

export const getSurveyById = async (surveyId: number) => {
  try {
    const survey: SurveyDetails = await apiClient.get(
      `api/GetSurvey/${surveyId}`
    );

    return survey;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to get survey:", error);

    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to get survey. Please try again."
    );
  }
};

export const renameProject = async (projectId: number, newName: string) => {
  try {
    const result = await apiClient.patch<boolean>(
      `api/RenameProject/${projectId}`,
      newName
    );

    return result;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to rename project:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to rename project. Please try again."
    );
  }
};
