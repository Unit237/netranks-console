import {
  apiClient,
  ApiError,
  type ApiRequestConfig,
} from "../../../app/lib/api";
import { BRAND_DATA } from "../../../app/utils/constant";
import type { BrandData, BrandOption } from "../@types";

type SurveyRequestPayload =
  | {
      brandId?: string;
      domain?: string;
      name?: string;
      icon?: string;
    }
  | string;

interface SurveyFetchStrategy {
  getLogPrefix(): string;
  getTypeLabel(): "brand" | "query";
  getEndpoint(): string;
  buildPayload(): SurveyRequestPayload;
  buildBrandData(
    response: BrandData,
    questionsArray: string[],
    questionIds: number[]
  ): BrandData;
}

class BrandFetchStrategy implements SurveyFetchStrategy {
  private readonly brand: BrandOption;

  constructor(brand: BrandOption) {
    this.brand = brand;
  }

  getLogPrefix() {
    return "[fetchQuestions - Brand]";
  }

  getTypeLabel() {
    return "brand" as const;
  }

  getEndpoint() {
    return "api/CreateSurveyFromBrand";
  }

  buildPayload(): SurveyRequestPayload {
    return {
      brandId: this.brand.brandId,
      domain: this.brand.domain,
      name: this.brand.name,
      icon: this.brand.icon,
    };
  }

  buildBrandData(
    response: BrandData,
    questionsArray: string[],
    questionIds: number[]
  ): BrandData {
    return {
      Id: response?.Id ?? 0,
      PasswordOne: response?.PasswordOne ?? null,
      PasswordTwo: response?.PasswordTwo ?? null,
      BrandName: response?.BrandName ?? this.brand.name ?? null,
      DescriptionOfTheBrand:
        response?.DescriptionOfTheBrand ?? this.brand.description ?? null,
      DescriptionOfTheBrandShort:
        response?.DescriptionOfTheBrandShort ?? this.brand.description ?? null,
      DescriptionOfTheQuestion: response?.DescriptionOfTheQuestion ?? null,
      DescriptionOfTheQuestionShort:
        response?.DescriptionOfTheQuestionShort ?? null,
      QueryType: response?.QueryType ?? "brand",
      Questions: questionsArray,
      QuestionIds: questionIds.length > 0 ? questionIds : undefined,
      WebsiteOfTheBrand: response?.WebsiteOfTheBrand ?? this.brand.domain ?? null,
    };
  }
}

class QueryFetchStrategy implements SurveyFetchStrategy {
  private readonly query: string;

  constructor(query: string) {
    this.query = query;
  }

  getLogPrefix() {
    return "[fetchQuestions - Query]";
  }

  getTypeLabel() {
    return "query" as const;
  }

  getEndpoint() {
    return "api/CreateSurveyFromQuery";
  }

  buildPayload(): SurveyRequestPayload {
    return this.query;
  }

  buildBrandData(
    response: BrandData,
    questionsArray: string[],
    questionIds: number[]
  ): BrandData {
    return {
      Id: response?.Id ?? 0,
      PasswordOne: response?.PasswordOne ?? null,
      PasswordTwo: response?.PasswordTwo ?? null,
      BrandName: response?.BrandName ?? null,
      DescriptionOfTheBrand:
        response?.DescriptionOfTheBrand ?? `Survey about: ${this.query}`,
      DescriptionOfTheBrandShort:
        response?.DescriptionOfTheBrandShort ?? this.query.substring(0, 100),
      DescriptionOfTheQuestion: response?.DescriptionOfTheQuestion ?? null,
      DescriptionOfTheQuestionShort:
        response?.DescriptionOfTheQuestionShort ?? null,
      QueryType: response?.QueryType ?? "query",
      Questions: questionsArray,
      QuestionIds: questionIds.length > 0 ? questionIds : undefined,
      WebsiteOfTheBrand: response?.WebsiteOfTheBrand ?? null,
    };
  }
}

function createSurveyFetchStrategy(
  input: BrandOption | string
): SurveyFetchStrategy {
  return typeof input === "string"
    ? new QueryFetchStrategy(input)
    : new BrandFetchStrategy(input);
}

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

export const fetchQuestions = async (
  input: BrandOption | string,
  options?: ApiRequestConfig
): Promise<BrandData> => {
  try {
    // Ensure we have a token before making the request
    // Note: Using dynamic imports here to avoid circular dependencies.
    // These modules are also statically imported elsewhere, which prevents code-splitting
    // but is necessary to avoid circular dependency issues.
    const { AuthService } = await import("../../../app/auth/AuthManager");

    const fetchStrategy = createSurveyFetchStrategy(input);
    const logPrefix = fetchStrategy.getLogPrefix();

    if (!AuthService.getVisitorToken()) {
      console.log(`${logPrefix} No token found, creating visitor session...`);
      await AuthService.ensureVisitorSession();
    }

    // Determine endpoint and payload based on input type
    const endpoint = fetchStrategy.getEndpoint();
    const payload = fetchStrategy.buildPayload();

    const response = await apiClient.post<BrandData>(
      endpoint,
      payload,
      options
    );

    // Handle different response formats - API might return array directly or wrapped
    let questionsArray: string[] = [];
    let questionIds: number[] = [];

    if (Array.isArray(response)) {
      questionsArray = response;
    } else if (response && Array.isArray(response.Questions)) {
      // Check if Questions is array of objects with Id and Text, or just strings
      const firstQuestion = response.Questions[0];
      if (
        response.Questions.length > 0 &&
        typeof firstQuestion === "object" &&
        firstQuestion !== null &&
        "Id" in firstQuestion &&
        "Text" in firstQuestion
      ) {
        // Questions are objects with Id and Text - use type assertion since we've verified the structure
        const questionsAsObjects = response.Questions as unknown as Array<{
          Id: number;
          Text: string;
        }>;
        questionsArray = questionsAsObjects.map((q) => q.Text);
        questionIds = questionsAsObjects.map((q) => q.Id);
      } else {
        // Questions are just strings
        questionsArray = response.Questions as string[];
      }
    } else if (typeof response === "object" && response !== null) {
      // Try to extract questions from object
      console.warn(`Unexpected response format from ${endpoint}:`, response);
      questionsArray = [];
    }

    if (questionsArray.length === 0) throw new Error("No questions found");

    // Transform response to match BrandData format, using API response values when available
    const brandData: BrandData = fetchStrategy.buildBrandData(
      response,
      questionsArray,
      questionIds
    );

    return brandData;
  } catch (error) {
    // Re-throw canceled requests
    if (error instanceof ApiError && error.isCanceled) {
      throw error;
    }

    // If 401 Unauthorized, try to recreate token and retry once
    if (error instanceof ApiError && error.status === 401) {
      const fetchStrategy = createSurveyFetchStrategy(input);
      const logPrefix = fetchStrategy.getLogPrefix();
      const endpoint = fetchStrategy.getEndpoint();
      const payload = fetchStrategy.buildPayload();

      console.warn(
        `${logPrefix} 401 Unauthorized, attempting to recreate token and retry...`
      );
      try {
        const onboardingModule = await import(
          "../../../app/services/onboardingService"
        );
        await onboardingModule.createOnboardingSession();

        // Retry the request once
        const questions = await apiClient.post<BrandData>(
          endpoint,
          payload,
          options
        );

        if (!questions) throw new Error("No questions found");
        return questions;
      } catch (retryError) {
        console.error(
          `${logPrefix} Retry after token recreation failed:`,
          retryError
        );
        throw error; // Throw original error
      }
    }

    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    const fetchStrategy = createSurveyFetchStrategy(input);
    const logPrefix = fetchStrategy.getLogPrefix();
    console.error(
      `Failed to fetch ${fetchStrategy.getTypeLabel()} questions: ${logPrefix}`,
      error
    );
    throw new ApiError(
      error instanceof Error
        ? error.message
        : "Unable to fetch questions. Please try again."
    );
  }
};

// Keep backward compatibility - these functions now call the unified function
export const fetchBrandQuestions = async (
  brand: BrandOption,
  options?: ApiRequestConfig
): Promise<BrandData> => {
  return fetchQuestions(brand, options);
};

export const fetchQueryQuestions = async (
  query: string,
  options?: ApiRequestConfig
): Promise<BrandData> => {
  return fetchQuestions(query, options);
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
