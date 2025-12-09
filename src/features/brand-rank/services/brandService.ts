import {
  apiClient,
  ApiError,
  type ApiRequestConfig,
} from "../../../app/lib/api";
import { BRAND_DATA } from "../../../app/utils/constant";
import type { BrandData, BrandOption } from "../@types";

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
  try {
    // Ensure we have a token before making the request
    const tokenModule = await import("../../../app/utils/token");
    const onboardingModule = await import("../../../app/services/onboardingService");
    
    if (!tokenModule.default.get()) {
      console.log("[fetchBrandQuestions] No token found, creating visitor session...");
      await onboardingModule.createOnboardingSession();
    }

    // Backend-main expects BrandDto with lowercase properties: brandId, domain, name, icon
    const brandDto = {
      brandId: brand.brandId,
      domain: brand.domain,
      name: brand.name,
      icon: brand.icon,
    };

    const questions = await apiClient.post<BrandData>(
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
    } else if (response && Array.isArray(response.questions)) {
      questionsArray = response.questions;
    } else if (typeof response === 'object' && response !== null) {
      // Try to extract questions from object
      console.warn("Unexpected response format from GenerateQuestionsFromQuery:", response);
      questionsArray = [];
    }
    
    if (questionsArray.length === 0) throw new Error("No questions found");

    // Transform response to match BrandData format
    const brandData: BrandData = {
      Id: 0, // Not provided by GenerateQuestionsFromQuery
      PasswordOne: null,
      PasswordTwo: null,
      BrandName: brand.name || null,
      DescriptionOfTheBrand: brand.description || null,
      DescriptionOfTheBrandShort: brand.description || null,
      DescriptionOfTheQuestion: null,
      DescriptionOfTheQuestionShort: null,
      QueryType: "brand",
      Questions: questionsArray,
      WebsiteOfTheBrand: brand.domain || null,
    };

    return brandData;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // If 401 Unauthorized, try to recreate token and retry once
    if (error instanceof ApiError && error.status === 401) {
      console.warn("[fetchBrandQuestions] 401 Unauthorized, attempting to recreate token and retry...");
      try {
        const onboardingModule = await import("../../../app/services/onboardingService");
        await onboardingModule.createOnboardingSession();
        
        // Retry the request once
        const brandDto = {
          brandId: brand.brandId,
          domain: brand.domain,
          name: brand.name,
          icon: brand.icon,
        };
        
        const questions = await apiClient.post<BrandData>(
          `api/CreateSurveyFromBrand`,
          brandDto,
          options
        );
        
        if (!questions) throw new Error("No questions found");
        return questions;
      } catch (retryError) {
        console.error("[fetchBrandQuestions] Retry after token recreation failed:", retryError);
        throw error; // Throw original error
      }
    }

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
  }
};

export const fetchQueryQuestions = async (
  query: string,
  options?: ApiRequestConfig
): Promise<BrandData> => {
  try {
    // Ensure we have a token before making the request
    // Import token and createOnboardingSession dynamically to avoid circular dependencies
    const tokenModule = await import("../../../app/utils/token");
    const onboardingModule = await import("../../../app/services/onboardingService");
    
    if (!tokenModule.default.get()) {
      console.log("[fetchQueryQuestions] No token found, creating visitor session...");
      await onboardingModule.createOnboardingSession();
    }

    const questions = await apiClient.post<BrandData>(
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
    } else if (response && Array.isArray(response.questions)) {
      questionsArray = response.questions;
    } else if (typeof response === 'object' && response !== null) {
      // Try to extract questions from object
      console.warn("Unexpected response format from GenerateQuestionsFromQuery:", response);
      questionsArray = [];
    }
    
    if (questionsArray.length === 0) throw new Error("No questions found");

    // Transform response to match BrandData format
    const brandData: BrandData = {
      Id: 0, // Not provided by GenerateQuestionsFromQuery
      PasswordOne: null,
      PasswordTwo: null,
      BrandName: null,
      DescriptionOfTheBrand: `Survey about: ${query}`,
      DescriptionOfTheBrandShort: query.substring(0, 100),
      DescriptionOfTheQuestion: null,
      DescriptionOfTheQuestionShort: null,
      QueryType: "query",
      Questions: questionsArray,
      WebsiteOfTheBrand: null,
    };

    return brandData;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // If 401 Unauthorized, try to recreate token and retry once
    if (error instanceof ApiError && error.status === 401) {
      console.warn("[fetchQueryQuestions] 401 Unauthorized, attempting to recreate token and retry...");
      try {
        const onboardingModule = await import("../../../app/services/onboardingService");
        await onboardingModule.createOnboardingSession();
        
        // Retry the request once
        const questions = await apiClient.post<BrandData>(
          `api/CreateSurveyFromQuery`,
          query,
          options
        );
        
        if (!questions) throw new Error("No questions found");
        return questions;
      } catch (retryError) {
        console.error("[fetchQueryQuestions] Retry after token recreation failed:", retryError);
        throw error; // Throw original error
      }
    }

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
  }
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
