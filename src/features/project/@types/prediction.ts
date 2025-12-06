// Use const enums (compile-time only) or string literal unions
const DetailLevel = {
  Standard: "standard",
  Detailed: "detailed",
} as const;
type DetailLevel = (typeof DetailLevel)[keyof typeof DetailLevel];

const ImpactLevel = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
} as const;
type ImpactLevel = (typeof ImpactLevel)[keyof typeof ImpactLevel];

const Priority = {
  Critical: "CRITICAL",
  High: "HIGH",
  Medium: "MEDIUM",
  Low: "LOW",
} as const;
type Priority = (typeof Priority)[keyof typeof Priority];

const Assessment = {
  Optimal: "Optimal",
  Good: "Good",
  TooComplex: "Too Complex",
  SlightlyObjective: "Slightly Objective",
} as const;
type Assessment = (typeof Assessment)[keyof typeof Assessment];

const SuggestionType = {
  Readability: "readability",
  ValueProposition: "value_proposition",
  TopPerformers: "top_performers",
  KeywordExamples: "keyword_examples",
  Templates: "templates",
  SentencePattern: "sentence_pattern",
  LengthBreakdown: "length_breakdown",
  SentenceBalance: "sentence_balance",
} as const;
type SuggestionType = (typeof SuggestionType)[keyof typeof SuggestionType];

const PerformanceTier = {
  HighTier: "🥈 High Tier (Rank 1-3)",
  MidTier: "🥉 Mid Tier (Rank 3-5)",
} as const;
type PerformanceTier = (typeof PerformanceTier)[keyof typeof PerformanceTier];

const CompetitionLevel = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
} as const;
type CompetitionLevel =
  (typeof CompetitionLevel)[keyof typeof CompetitionLevel];

const Confidence = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
} as const;
type Confidence = (typeof Confidence)[keyof typeof Confidence];

// Core interfaces
interface ActionPriority {
  action: string;
  current_state: string;
  effort: string;
  estimated_improvement: string;
  feature_rank: number | string;
  feature_score: number | string;
  impact: ImpactLevel;
  priority: number;
  quick_tip: string;
  target_state: string;
}

interface ContentComponent {
  action: string;
  assessment: Assessment;
  current: string;
  feature_rank: number | string;
  feature_score: number | string;
  score: number;
  target: string;
}

interface QuickWin {
  action: string;
  component: string;
  score: number;
}

interface Strength {
  assessment: Assessment;
  component: string;
  score: number;
}

interface TopPriority {
  action: string;
  component: string;
  current: string;
  feature_rank: number;
  score: number;
  target: string;
}

interface ContentQuality {
  components: {
    engagement: ContentComponent;
    keyword_density: ContentComponent;
    readability: ContentComponent;
    sentiment: ContentComponent;
    structure: ContentComponent;
  };
  grade: string;
  overall_score: number;
  quick_wins: QuickWin[];
  strengths: Strength[];
  top_priorities: TopPriority[];
}

interface PercentileAnalysis {
  keyword_coverage: {
    percentage: number;
    present: number;
    rating: string;
    total_important: number;
  };
}

interface RankBenchmarks {
  avg_length: number;
  avg_words: number;
  common_words: string[];
  count: number;
  top_brands: string[];
  top_domains: string[];
}

interface YourMetrics {
  length: number;
  predicted_rank: number;
  word_count: number;
}

interface GapAnalysis {
  gap: string;
  metric: string;
  recommendation: string;
  severity: string;
}

interface PerformanceBenchmark {
  gap_analysis?: GapAnalysis[];
  percentile_analysis?: PercentileAnalysis;
  performance_tier?: PerformanceTier;
  rank_0_benchmarks?: RankBenchmarks;
  rank_1_3_benchmarks?: Record<string, any>;
  your_metrics?: YourMetrics;
}

interface CompetitiveDensity {
  difficulty_score: number;
  interpretation: string;
  level: CompetitionLevel;
  ratio: string;
}

interface MarketAnalysis {
  market_concentration: string;
  success_rate: string;
  top_performers: number;
  total_entries: number;
  unique_brands: number;
  unique_domains: number;
}

interface OptimizationPotential {
  area: string;
  current: string;
  potential_gain: string;
  priority: string;
  target: string;
}

interface SuccessProbability {
  confidence: Confidence;
  estimated_rank_range: string;
  factors: {
    keyword_match: number;
    length_match: number;
  };
  score: number;
}

interface StatisticalInsights {
  competitive_density?: CompetitiveDensity;
  market_analysis?: MarketAnalysis;
  optimization_potential?: OptimizationPotential[];
  success_probability?: SuccessProbability;
}

// Description suggestion interfaces
interface ComplexSentence {
  original: string;
  reason: string;
  sentence_num: number;
  simplified: string;
}

interface ReadabilityContent {
  action: string;
  complex_sentences: ComplexSentence[];
  current_state: string;
  effort: string;
  feature_rank: number;
  feature_score: number;
  impact: string;
  priority: Priority;
  quick_tip: string;
  suggestion: string;
  summary: string;
  target_state: string;
  title: string;
  type: "readability";
}

interface ValuePropositionContent {
  action: string;
  current_opening: string;
  current_state: string;
  effort: string;
  feature_rank: string;
  feature_score: string;
  impact: string;
  priority: Priority;
  quick_tip: string;
  suggested_opening: string;
  suggestion: string;
  summary: string;
  target_state: string;
  title: string;
  type: "value_proposition";
}

interface TopPerformerExample {
  description: string;
  rank: number;
  why_it_works: string;
}

interface TopPerformersContent {
  action: string;
  current_state: string;
  examples: TopPerformerExample[];
  impact: string;
  quick_tip: string;
  suggestion: string;
  summary: string;
  target_state: string;
  title: string;
  type: "top_performers";
}

interface KeywordExample {
  keyword: string;
  sentences: string[];
}

interface KeywordExamplesContent {
  action: string;
  current_state: string;
  impact: string;
  keyword_examples: KeywordExample[];
  quick_tip: string;
  suggestion: string;
  summary: string;
  target_state: string;
  title: string;
  type: "keyword_examples";
}

interface Template {
  filled_example: string;
  name: string;
  template: string;
  usage: string;
}

interface TemplatesContent {
  action: string;
  current_state: string;
  impact: string;
  quick_tip: string;
  suggestion: string;
  summary: string;
  target_state: string;
  templates: Template[];
  title: string;
  type: "templates";
}

interface SentencePatternContent {
  action: string;
  current_pattern: string;
  current_state: string;
  effort: string;
  impact: string;
  priority: Priority;
  quick_tip: string;
  recommended_pattern: {
    example: {
      sentence_1: string;
      sentence_2: string;
      sentence_3: string;
    };
    num_sentences: number;
    pattern: string;
  };
  suggestion: string;
  summary: string;
  target_state: string;
  template: string;
  title: string;
  type: "sentence_pattern";
}

interface LengthBreakdownContent {
  action: string;
  adjustments: {
    action: string;
    gap_chars: number;
    suggestions: string[];
  };
  current_length: number;
  current_state: string;
  effort: string;
  gap: number;
  impact: string;
  priority: Priority;
  quick_tip: string;
  suggestion: string;
  summary: string;
  target_length: number;
  target_state: string;
  title: string;
  type: "length_breakdown";
}

interface UnbalancedSentence {
  balanced_version: string;
  issue: string;
  original: string;
  sentence_num: number;
  word_count: number;
}

interface SentenceBalanceContent {
  action: string;
  avg_words_per_sentence: string;
  current_state: string;
  effort: string;
  impact: string;
  priority: Priority;
  quick_tip: string;
  suggestion: string;
  summary: string;
  target_range: string;
  target_state: string;
  title: string;
  type: "sentence_balance";
  unbalanced_sentences: UnbalancedSentence[];
}

type DescriptionContent =
  | ReadabilityContent
  | ValuePropositionContent
  | TopPerformersContent
  | KeywordExamplesContent
  | TemplatesContent
  | SentencePatternContent
  | LengthBreakdownContent
  | SentenceBalanceContent;

interface KeywordSuggestion {
  category: string;
  current_state: string;
  effort: string;
  feature_rank: string;
  feature_score: number;
  gap: string;
  impact: string;
  priority: Priority;
  quick_tip: string;
  suggestion: string;
  target_state: string;
}

interface ReadabilitySuggestion {
  category: string;
  current_state: string;
  effort: string;
  feature_rank: number;
  feature_score: number;
  gap: string;
  impact: string;
  priority: Priority;
  quick_tip: string;
  suggestion: string;
  target_state: string;
}

interface DescriptionSuggestions {
  content: DescriptionContent[];
  examples: (
    | TopPerformersContent
    | KeywordExamplesContent
    | TemplatesContent
  )[];
  keywords: KeywordSuggestion[];
  length: any[];
  readability: ReadabilitySuggestion[];
  structure: (
    | SentencePatternContent
    | LengthBreakdownContent
    | SentenceBalanceContent
  )[];
}

interface Suggestions {
  description: DescriptionSuggestions;
}

interface Prediction {
  current_rank: number | null;
  improvement: number | null;
  predicted_rank: number;
  uncertainty: number;
}

interface EnhancedData {
  action_priorities: ActionPriority[];
  content_quality: ContentQuality;
  performance_benchmark: PerformanceBenchmark;
  statistical_insights: StatisticalInsights;
}

interface Result {
  detail_level: DetailLevel;
  enhanced: EnhancedData;
  formatted_suggestions: string;
  item_index: number;
  prediction: Prediction;
  success: boolean;
  suggestions: Suggestions;
}

// Main response interface
interface RankingAnalysisResponse {
  errors: any[];
  failed_predictions: number;
  results: Result[];
  success: boolean;
  successful_predictions: number;
  timestamp: string;
  total_items: number;
}

// Export all types
export type {
  ActionPriority,
  ComplexSentence,
  ContentComponent,
  ContentQuality,
  DescriptionContent,
  DescriptionSuggestions,
  EnhancedData,
  KeywordExample,
  KeywordSuggestion,
  PerformanceBenchmark,
  Prediction,
  QuickWin,
  RankingAnalysisResponse,
  ReadabilitySuggestion,
  Result,
  StatisticalInsights,
  Strength,
  Suggestions,
  Template,
  TopPerformerExample,
  TopPriority,
  UnbalancedSentence,
};

export {
  Assessment,
  CompetitionLevel,
  Confidence,
  DetailLevel,
  ImpactLevel,
  PerformanceTier,
  Priority,
  SuggestionType,
};
