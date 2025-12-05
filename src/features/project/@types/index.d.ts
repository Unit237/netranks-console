// =========================
// QUESTIONS
// =========================

export interface SurveyQuestion {
  Id: number;
  Text: string;
}

// =========================
// DASHBOARD → SURVEY STATS
// =========================

export interface SurveyStatsOverview {
  QueriesRun: number;
  PromptVariations: number;
  BrandsIdentified: number;
  SurveyDepth: number;
}

// =========================
// DASHBOARD → TOP BRANDS
// =========================

export interface TopBrand {
  Name: string;
  Percentage: number;
}

// =========================
// DASHBOARD → TOP CITATIONS
// =========================

export interface TopCitation {
  RegistrableDomain: string;
  Percentage: number;
}

// =========================
// DASHBOARD → SAMPLE ANSWERS
// =========================

export interface SampleAiAnswerSnippet {
  Id: number;
  Date: string;
  Question: string;
  AnswerUrl: string;
}

// =========================
// DASHBOARD ROOT OBJECT
// =========================

export interface SurveyDashboard {
  FilteredBrand: string | null;
  VisibilityTrendsOverTime: number | null;
  VisibilityScore: number | null;
  SurveyStatsOverview: SurveyStatsOverview;
  TopBrandsInAiAnswers: TopBrand[];
  TopCitationsInAiAnswers: TopCitation[];
  SampleAiAnswerSnippets: SampleAiAnswerSnippet[];
}

// =========================
// MAIN SURVEY DETAILS TYPE
// =========================

export interface SurveyDetails {
  Id: number;
  Name: string | null;
  PasswordOne: string;
  PasswordTwo: string;
  RunCount: number;
  CurrentlyRunningSurveyRunId: number | null;
  SchedulePeriodHours: number;
  NextRunAt: string | null;
  Questions: SurveyQuestion[];
  Dashboard: SurveyDashboard;
}
