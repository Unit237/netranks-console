export interface VisibilityTrend {
  Date: string; // ISO string
  NumberOfAnswersMentioningThisBrand: number;
  TotalNumberOfAnswers: number;
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
  Id: number;
  Date: string; // ISO string
  Question: string;
  AnswerUrl: string;
}

export interface MentionedBrand {
  Id: number;
  Name: string;
  Count: number;
}

export interface VisibilityTableRow {
  Prompt: string;
  BrandsMentioned: MentionedBrand[];
  YourBrandMentioned: boolean;
  Position: number;
}

export interface SurveyStatsResponse {
  VisibilityTrendsOverTime: VisibilityTrend[];
  VisibilityScore: number;
  SurveyStatsOverview: SurveyStatsOverview;
  TopBrandsInAiAnswers: TopBrand[];
  TopCitationsInAiAnswers: TopCitation[];
  SampleAiAnswerSnippets: AiAnswerSnippet[];
  VisibilityTable: VisibilityTableRow[];
}
