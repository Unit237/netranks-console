import { apiClient, ApiError } from "../../../app/lib/api";
import type { Member } from "../@types";

export const fetchAllMembers = async (projectId: number): Promise<Member[]> => {
  try {
    const membersData = await apiClient.get<Member[]>(
      `api/GetMembers/${projectId}`
    );

    return membersData;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to fetch member:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to fetch member. Please try again."
    );
  }
};
