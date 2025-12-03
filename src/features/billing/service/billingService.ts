import { apiClient, ApiError } from "../../../app/lib/api";

export const createSetupIntent = async (projectId: number) => {
  try {
    const stripeKey: string = await apiClient.get(
      `api/CreateSetupIntent/${projectId}`
    );

    return stripeKey;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to create setup intent:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to create setup intent. Please try again."
    );
  }
};

export const setPaymentMethod = async (
  projectId: number,
  paymentMethod: string | any
) => {
  try {
    const stripeKey = await apiClient.post(
      `api/SetPaymentMethod/${projectId}`,
      {
        paymentMethod,
      }
    );

    return stripeKey;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to set payment method:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to set payment method. Please try again."
    );
  }
};
