export interface SurveyStatsResponse {
  SurveyStatsOverview: SurveyStatsOverview;
  TopBrandsInAiAnswers: TopBrand[];
  TopCitationsInAiAnswers: TopCitation[];
  SampleAiAnswerSnippets: AiAnswerSnippet[];
  VisibilityTable: VisibilityEntry[];
}

export interface SurveyStatsOverview {
  QueriesRun: number;
  PromptVariations: number;
  BrandsIdentified: number;
  SurveyDepth: number;
}

export interface TopBrand {
  Name: string;
  Percentage: number;
}

export interface TopCitation {
  RegistrableDomain: string;
  Percentage: number;
}

export interface AiAnswerSnippet {
  Question: string;
  AnswerUrl: string;
}

export interface VisibilityEntry {
  Prompt: string;
  BrandsMentioned: string[];
  YourBrandMentioned: boolean;
  Position: number | null;
}
