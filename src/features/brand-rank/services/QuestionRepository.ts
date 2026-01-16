import type { ApiRequestConfig } from "../../../app/lib/api";
import { BaseRepository } from "../../../app/services/repository/BaseRepository";

export class QuestionRepository extends BaseRepository<number> {
  async addQuestion(
    surveyId: number,
    question: string,
    options?: ApiRequestConfig
  ): Promise<number> {
    return this.post<number>(
      "api/AddQuestion",
      {
        SurveyId: surveyId,
        Question: question,
      },
      options
    );
  }

  async editQuestion(
    questionId: number,
    question: string,
    options?: ApiRequestConfig
  ): Promise<number> {
    return this.put<number>(
      `api/EditQuestion/${questionId}`,
      { question },
      options
    );
  }

  async deleteQuestion(
    questionId: string,
    options?: ApiRequestConfig
  ): Promise<void> {
    await this.delete<void>(`api/DeleteQuestion/${questionId}`, options);
  }

  async generateQuestionsFromQuery(
    query: string,
    options?: ApiRequestConfig
  ): Promise<string[]> {
    return this.post<string[]>("api/GenerateQuestionsFromQuery", query, options);
  }

  async generateQuestionsFromBrand(
    payload: {
      brandId?: string;
      domain?: string;
      name?: string;
      icon?: string;
    },
    options?: ApiRequestConfig
  ): Promise<string[]> {
    return this.post<string[]>(
      "api/GenerateQuestionsFromBrand",
      payload,
      options
    );
  }
}

