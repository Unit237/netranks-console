export interface Question {
  Id: number;
  Text: string;
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

export interface SampleAiAnswerSnippet {
  Id: number;
  Date: string;
  Question: string;
  AnswerUrl: string;
}

export interface BrandMention {
  Id: number;
  Name: string;
  Count: number;
}

export interface VisibilityTableEntry {
  Prompt: string;
  BrandsMentioned: BrandMention[];
  YourBrandMentioned: any;
  Position: any;
}

export interface VisibilityTrendData {
  Date: string;
  NumberOfAnswersMentioningThisBrand: number;
  TotalNumberOfAnswers: number;
}

export interface FilteredBrand {
  Name: string;
}

export interface Dashboard {
  FilteredBrand: FilteredBrand;
  VisibilityTrendsOverTime: VisibilityTrendData[];
  VisibilityScore: number;
  SurveyStatsOverview: SurveyStatsOverview;
  TopBrandsInAiAnswers: TopBrand[];
  TopCitationsInAiAnswers: TopCitation[];
  SampleAiAnswerSnippets: SampleAiAnswerSnippet[];
  VisibilityTable: VisibilityTableEntry[];
}

export interface SurveyDetails {
  Id: number;
  Name: string | null;
  PasswordOne: string;
  PasswordTwo: string;
  RunCount: number;
  CurrentlyRunningSurveyRunId: number | null;
  SchedulePeriodHours: number;
  NextRunAt: string | null;
  Questions: Question[];
  Dashboard: Dashboard;
}
