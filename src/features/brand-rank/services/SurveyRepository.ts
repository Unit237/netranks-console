import type { ApiRequestConfig } from "../../../app/lib/api";
import { BaseRepository } from "../../../app/services/repository/BaseRepository";
import type { BrandData, BrandOption } from "../@types";

type ParsedQuestions = {
  questionsArray: string[];
  questionIds: number[];
};

export type ParsedSurveyResponse = ParsedQuestions & {
  response: BrandData;
};

interface ResponseParsingStrategy {
  parse(response: BrandData, endpoint: string): ParsedQuestions;
}

class ArrayResponseStrategy implements ResponseParsingStrategy {
  parse(response: BrandData): ParsedQuestions {
    return {
      questionsArray: response as unknown as string[],
      questionIds: [],
    };
  }
}

class ObjectArrayStrategy implements ResponseParsingStrategy {
  parse(response: BrandData): ParsedQuestions {
    const questionsAsObjects = response.Questions as unknown as Array<{
      Id: number;
      Text: string;
    }>;
    return {
      questionsArray: questionsAsObjects.map((q) => q.Text),
      questionIds: questionsAsObjects.map((q) => q.Id),
    };
  }
}

class StringArrayStrategy implements ResponseParsingStrategy {
  parse(response: BrandData): ParsedQuestions {
    return {
      questionsArray: response.Questions as unknown as string[],
      questionIds: [],
    };
  }
}

class FallbackParsingStrategy implements ResponseParsingStrategy {
  parse(response: BrandData, endpoint: string): ParsedQuestions {
    console.warn(`Unexpected response format from ${endpoint}:`, response);
    return { questionsArray: [], questionIds: [] };
  }
}

function selectResponseParsingStrategy(
  response: BrandData
): ResponseParsingStrategy {
  if (Array.isArray(response)) {
    return new ArrayResponseStrategy();
  }

  if (response && Array.isArray(response.Questions)) {
    const firstQuestion = response.Questions[0];
    if (
      response.Questions.length > 0 &&
      typeof firstQuestion === "object" &&
      firstQuestion !== null &&
      "Id" in firstQuestion &&
      "Text" in firstQuestion
    ) {
      return new ObjectArrayStrategy();
    }

    return new StringArrayStrategy();
  }

  return new FallbackParsingStrategy();
}

export class SurveyRepository extends BaseRepository<BrandData> {
  async createSurveyFromBrand(
    brand: BrandOption,
    options?: ApiRequestConfig
  ): Promise<ParsedSurveyResponse> {
    const endpoint = "api/CreateSurveyFromBrand";
    const response = await this.post<BrandData>(
      endpoint,
      {
        brandId: brand.brandId,
        domain: brand.domain,
        name: brand.name,
        icon: brand.icon,
      },
      options
    );

    return this.parseSurveyResponse(response, endpoint);
  }

  async createSurveyFromQuery(
    query: string,
    options?: ApiRequestConfig
  ): Promise<ParsedSurveyResponse> {
    const endpoint = "api/CreateSurveyFromQuery";
    const response = await this.post<BrandData>(endpoint, query, options);
    return this.parseSurveyResponse(response, endpoint);
  }

  async startSurvey(
    surveyId: number,
    questionIndices?: number[],
    options?: ApiRequestConfig
  ): Promise<string> {
    if (questionIndices && questionIndices.length > 0) {
      return this.post<string>(`api/StartSurvey/${surveyId}`, {
        questionIndices,
      }, options);
    }

    return this.get<string>(`api/StartSurvey/${surveyId}`, options);
  }

  async getSurveyRun(
    surveyRunId?: string,
    p1?: string,
    p2?: string
  ) {
    return this.get(`api/GetSurveyRun/${surveyRunId}/${p1}/${p2}`);
  }

  private parseSurveyResponse(
    response: BrandData,
    endpoint: string
  ): ParsedSurveyResponse {
    const parsingStrategy = selectResponseParsingStrategy(response);
    const { questionsArray, questionIds } = parsingStrategy.parse(
      response,
      endpoint
    );

    return {
      response,
      questionsArray,
      questionIds,
    };
  }
}

