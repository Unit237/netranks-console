import { apiClient, ApiError } from "../../../app/lib/api";
import type { Project } from "../../auth/@types";

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

    console.error("Failed to schedule survey:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to schedule survey. Please try again."
    );
  }
};

export const getProjectById = async (projectId: number) => {
  try {
    const project: Project = await apiClient.get(`api/GetProject/${projectId}`);

    return project;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to get project:", error);

    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to get project. Please try again."
    );
  }
};
