import {
  apiClient,
  ApiError,
  type ApiRequestConfig,
} from "../../../app/lib/api";
import { BRAND_DATA } from "../../../app/utils/constant";
import type { BrandData, BrandOption } from "../@types";

// Module-level deduplication: Track in-flight requests to prevent duplicate POSTs
// Root cause fix: Component-level guards aren't sufficient - React StrictMode/race conditions
// can still cause duplicate function calls. This ensures only one request per brandId/query.
const inFlightBrandRequests = new Map<string, Promise<BrandData>>();
const inFlightQueryRequests = new Map<string, Promise<BrandData>>();

export const searchBrands = async (
  query: string,
  signal?: AbortSignal
): Promise<BrandOption[]> => {
  try {
    // const brands = await brandFetchApi.get<BrandOption[]>(
    //   `/search/${encodeURIComponent(query)}`
    // );

    // const brands = await brandFetchApi.get<BrandOption[]>(
    //   `/search/${encodeURIComponent(query)}`,
    //   { signal }
    // );

    const res = await fetch(
      `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}`,
      { signal }
    );

    if (!res.ok) throw new Error(res.statusText);

    const brands: BrandOption[] = await res.json();
    // If no results, return a custom fallback option
    if (brands.length === 0) {
      return [
        {
          brandId: "_custom",
          icon: "",
          name: query,
          domain: "",
          claimed: false,
          qualityScore: 0,
          verified: false,
          _score: 0,
          description: "",
        },
      ];
    }

    return brands;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to search brands:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to search brands. Please try again."
    );
  }
};

export const fetchBrandQuestions = async (
  brand: BrandOption,
  options?: ApiRequestConfig
): Promise<BrandData> => {
  // Deduplication: Check if a request for this brandId is already in-flight
  // Root cause fix: Component guards aren't sufficient - React StrictMode/race conditions
  // can still cause duplicate function calls. Return existing promise if already fetching.
  const requestKey = brand.brandId;
  const existingRequest = inFlightBrandRequests.get(requestKey);
  if (existingRequest) {
    console.log(`[fetchBrandQuestions] Request for brandId "${requestKey}" already in-flight, returning existing promise`);
    return existingRequest;
  }

  // Pre-flight: Ensure token exists BEFORE making POST to prevent 401 and duplicate POSTs
  // Root cause fix: Previous 401 retry logic caused duplicate POSTs (one before 401, one after retry)
  // Solution: Create session pre-flight, then make single POST. Module-level deduplication prevents double calls.
  const tokenModule = await import("../../../app/utils/token");
  const onboardingModule = await import("../../../app/services/onboardingService");
  
  // Ensure token exists before POST - this prevents 401 errors and the need for retry logic
  if (!tokenModule.default.getVisitor()) {
    console.log("[fetchBrandQuestions] No token found, creating visitor session before POST...");
    await onboardingModule.createOnboardingSession();
    
    // Verify token was created (defensive check)
    if (!tokenModule.default.getVisitor()) {
      throw new ApiError(
        "Failed to create visitor session. Please try again.",
        401
      );
    }
  }

  // Create the request promise and store it to prevent duplicates
  const requestPromise = (async (): Promise<BrandData> => {
    try {
    // Backend-main expects BrandDto with lowercase properties: brandId, domain, name, icon
    const brandDto = {
      brandId: brand.brandId,
      domain: brand.domain,
      name: brand.name,
      icon: brand.icon,
    };

    // Single POST request - no retry logic to prevent duplicate calls
    // Component-level guards (useRef) prevent React re-renders from calling this twice
    const response = await apiClient.post<BrandData>(
      `api/CreateSurveyFromBrand`,
      brandDto,
      options
    );

    // Handle different response formats - API might return array directly or wrapped
    let questionsArray: string[] = [];
    if (Array.isArray(response)) {
      questionsArray = response;
    } else if (response && Array.isArray(response.Questions)) {
      questionsArray = response.Questions;
    } else if (typeof response === 'object' && response !== null) {
      // Try to extract questions from object (defensive check for unexpected formats)
      console.warn("Unexpected response format from CreateSurveyFromBrand:", response);
      questionsArray = [];
    }
    
    if (questionsArray.length === 0) throw new Error("No questions found");

    // Transform response to match BrandData format, using API response values when available
    const brandData: BrandData = {
      Id: response?.Id ?? 0,
      PasswordOne: response?.PasswordOne ?? null,
      PasswordTwo: response?.PasswordTwo ?? null,
      BrandName: response?.BrandName ?? brand.name ?? null,
      DescriptionOfTheBrand: response?.DescriptionOfTheBrand ?? brand.description ?? null,
      DescriptionOfTheBrandShort: response?.DescriptionOfTheBrandShort ?? brand.description ?? null,
      DescriptionOfTheQuestion: response?.DescriptionOfTheQuestion ?? null,
      DescriptionOfTheQuestionShort: response?.DescriptionOfTheQuestionShort ?? null,
      QueryType: response?.QueryType ?? "brand",
      Questions: questionsArray,
      WebsiteOfTheBrand: response?.WebsiteOfTheBrand ?? brand.domain ?? null,
    };

      return brandData;
    } catch (error) {
      // Re-throw canceled requests
      if (error instanceof ApiError && error.isCanceled) {
        throw error;
      }

      // Removed 401 retry logic to prevent duplicate POSTs
      // Root cause: 401 retry made second POST, creating duplicate surveys
      // Fix: Token exists pre-flight, so 401 should not occur. If it does, fail gracefully.
      // Module-level deduplication prevents React from calling this function twice concurrently.

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Failed to fetch brand questions:", error);
      throw new ApiError(
        error instanceof Error
          ? error.message
          : "Unable to fetch questions. Please try again."
      );
    } finally {
      // Clean up: Remove from in-flight map when request completes (success or error)
      inFlightBrandRequests.delete(requestKey);
    }
  })();

  // Store the promise to prevent duplicate requests
  inFlightBrandRequests.set(requestKey, requestPromise);

  return requestPromise;
};

export const fetchQueryQuestions = async (
  query: string,
  options?: ApiRequestConfig
): Promise<BrandData> => {
  // Deduplication: Check if a request for this query is already in-flight
  // Root cause fix: Component guards aren't sufficient - React StrictMode/race conditions
  // can still cause duplicate function calls. Return existing promise if already fetching.
  const requestKey = query.trim().toLowerCase();
  const existingRequest = inFlightQueryRequests.get(requestKey);
  if (existingRequest) {
    console.log(`[fetchQueryQuestions] Request for query "${query}" already in-flight, returning existing promise`);
    return existingRequest;
  }

  // Pre-flight: Ensure token exists BEFORE making POST to prevent 401 and duplicate POSTs
  // Root cause fix: Previous 401 retry logic caused duplicate POSTs (one before 401, one after retry)
  // Solution: Create session pre-flight, then make single POST. Module-level deduplication prevents double calls.
  // Import token and createOnboardingSession dynamically to avoid circular dependencies
  const tokenModule = await import("../../../app/utils/token");
  const onboardingModule = await import("../../../app/services/onboardingService");
  
  // Ensure token exists before POST - this prevents 401 errors and the need for retry logic
  if (!tokenModule.default.getVisitor()) {
    console.log("[fetchQueryQuestions] No token found, creating visitor session before POST...");
    await onboardingModule.createOnboardingSession();
    
    // Verify token was created (defensive check)
    if (!tokenModule.default.getVisitor()) {
      throw new ApiError(
        "Failed to create visitor session. Please try again.",
        401
      );
    }
  }

  // Create the request promise and store it to prevent duplicates
  const requestPromise = (async (): Promise<BrandData> => {
    try {
    // Single POST request - no retry logic to prevent duplicate calls
    // Component-level guards (useRef) prevent React re-renders from calling this twice
    const response = await apiClient.post<BrandData>(
      `api/CreateSurveyFromQuery`,
      query,
      options
    );

    // Handle different response formats - API might return array directly or wrapped
    let questionsArray: string[] = [];
    if (Array.isArray(response)) {
      questionsArray = response;
    } else if (response && Array.isArray(response.Questions)) {
      questionsArray = response.Questions;
    } else if (typeof response === 'object' && response !== null) {
      // Try to extract questions from object (defensive check for unexpected formats)
      console.warn("Unexpected response format from CreateSurveyFromQuery:", response);
      questionsArray = [];
    }
    
    if (questionsArray.length === 0) throw new Error("No questions found");

    // Transform response to match BrandData format, using API response values when available
    const brandData: BrandData = {
      Id: response?.Id ?? 0,
      PasswordOne: response?.PasswordOne ?? null,
      PasswordTwo: response?.PasswordTwo ?? null,
      BrandName: response?.BrandName ?? null,
      DescriptionOfTheBrand: response?.DescriptionOfTheBrand ?? `Survey about: ${query}`,
      DescriptionOfTheBrandShort: response?.DescriptionOfTheBrandShort ?? query.substring(0, 100),
      DescriptionOfTheQuestion: response?.DescriptionOfTheQuestion ?? null,
      DescriptionOfTheQuestionShort: response?.DescriptionOfTheQuestionShort ?? null,
      QueryType: response?.QueryType ?? "query",
      Questions: questionsArray,
      WebsiteOfTheBrand: response?.WebsiteOfTheBrand ?? null,
    };

      return brandData;
    } catch (error) {
      // Re-throw canceled requests
      if (error instanceof ApiError && error.isCanceled) {
        throw error;
      }

      // Removed 401 retry logic to prevent duplicate POSTs
      // Root cause: 401 retry made second POST, creating duplicate surveys
      // Fix: Token exists pre-flight, so 401 should not occur. If it does, fail gracefully.
      // Module-level deduplication prevents React from calling this function twice concurrently.

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Failed to fetch query questions:", error);
      throw new ApiError(
        error instanceof Error
          ? error.message
          : "Unable to fetch questions. Please try again."
      );
    } finally {
      // Clean up: Remove from in-flight map when request completes (success or error)
      inFlightQueryRequests.delete(requestKey);
    }
  })();

  // Store the promise to prevent duplicate requests
  inFlightQueryRequests.set(requestKey, requestPromise);

  return requestPromise;
};

export const startSurvey = async (
  surveyId: number,
  questionIndices?: number[],
  options?: ApiRequestConfig
): Promise<string> => {
  try {
    let response: string;

    if (questionIndices && questionIndices.length > 0) {
      // 🔹 POST request with questionIndices
      response = await apiClient.post<string>(
        `api/StartSurvey/${surveyId}`,
        { questionIndices },
        options
      );
    } else {
      // 🔹 GET request if no questionIndices
      response = await apiClient.get<string>(
        `api/StartSurvey/${surveyId}`,
        options
      );
    }

    return response;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to start survey:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to start survey. Please try again."
    );
  }
};

export const getSurveyRun = async (
  surveyRunId?: string,
  p1?: string,
  p2?: string
) => {
  try {
    const surveyRun = await apiClient.get(
      `api/GetSurveyRun/${surveyRunId}/${p1}/${p2}`
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

export const addQuestion = async (
  surveyId: number,
  question: string
): Promise<number> => {
  try {
    const newQuestionId: number = await apiClient.post(`api/AddQuestion`, {
      SurveyId: surveyId,
      Question: question,
    });

    return newQuestionId;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to add question:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to add questions. Please try again."
    );
  }
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  try {
    await apiClient.delete(`api/DeleteQuestion/${questionId}`);
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to delete question:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to delete questions. Please try again."
    );
  }
};

export const editQuestion = async (
  questionId: number,
  question: string
): Promise<number> => {
  try {
    const editQuestionId: number = await apiClient.put(
      `api/EditQuestion/${questionId}`,
      {
        question,
      }
    );

    return editQuestionId;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to edit question:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to edit questions. Please try again."
    );
  }
};

export const createProject = async (projectName: string) => {
  try {
    const projectId = await apiClient.post(`api/CreateNewProject`, projectName);

    return projectId;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Failed to create project:", error);
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to create project. Please try again."
    );
  }
};

export const searchBrand = async (query: string) => {
  if (!query.trim()) return null;

  await new Promise((resolve) => setTimeout(resolve, 3000));

  if (!query.trim()) return null;

  // const lowerQuery = query.toLowerCase();

  return BRAND_DATA.find((brand) => {
    const fields = [
      brand.BrandName,
      brand.DescriptionOfTheBrand,
      brand.DescriptionOfTheBrandShort,
      brand.DescriptionOfTheQuestion,
      brand.DescriptionOfTheQuestionShort,
      brand.WebsiteOfTheBrand,
      ...(brand.Questions || []),
    ];

    return fields.some((field) => field && field);
  });
};
