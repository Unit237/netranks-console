import { fetchApi, type ApiRequestOptions } from "../../../app/lib/ApiClient";
import type { BrandData, BrandOption } from "../@types";

export const searchBrands = async (
  query: string,
  signal?: AbortSignal
): Promise<BrandOption[]> => {
  try {
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
    // Re-throw AbortError to handle it separately
    if ((error as Error).name === "AbortError") {
      throw error;
    }

    console.error("Failed to search brands:", error);
    throw new Error("Unable to search brands. Please try again.");
  }
};

export const fetchBrandQuestions = async (
  brand: BrandOption,
  options?: ApiRequestOptions
): Promise<BrandData> => {
  try {
    const questions = await fetchApi.post<BrandData>(
      `api/CreateSurveyFromBrand`,
      brand,
      options
    );

    console.log(questions);

    return questions;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message === "Request canceled with cancel token")
    ) {
      throw error;
    }

    console.error("Failed to fetch brand questions:", error);
    throw new Error("Unable to fetch questions. Please try again.");
  }
};

export const fetchQueryQuestions = async (
  query: string,
  options?: ApiRequestOptions
): Promise<BrandData> => {
  try {
    const questions = await fetchApi.post<BrandData>(
      `api/CreateSurveyFromQuery`,
      query,
      options
    );

    console.log(questions);

    return questions;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message === "Request canceled with cancel token")
    ) {
      throw error;
    }

    console.error("Failed to fetch query questions:", error);
    throw new Error("Unable to fetch questions. Please try again.");
  }
};

export const startSurvey = async (
  surveyId: number,
  questionIndices?: number[],
  options?: ApiRequestOptions
): Promise<string> => {
  try {
    let response: string;

    if (questionIndices && questionIndices.length > 0) {
      // 🔹 POST request with questionIndices
      response = await fetchApi.post<string>(
        `api/StartSurvey/${surveyId}`,
        { questionIndices },
        options
      );
    } else {
      // 🔹 GET request if no questionIndices
      response = await fetchApi.get<string>(
        `api/StartSurvey/${surveyId}`,
        options
      );
    }

    console.log("Survey started:", response);
    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "AbortError" ||
        error.message === "Request canceled with cancel token")
    ) {
      throw error;
    }

    console.error("Failed to start survey:", error);
    throw new Error("Unable to start survey. Please try again.");
  }
};

export const getSurveyRun = async (
  surveyRunId?: string,
  p1?: string,
  p2?: string
) => {
  try {
    const surveyRun = await fetchApi.get(
      `api/GetSurveyRun/${surveyRunId}/${p1}/${p2}`
    );

    return surveyRun;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error;
    }

    console.error("Failed to get survey run:", error);
    throw new Error("Unable to get survey run. Please try again.");
  }
};
