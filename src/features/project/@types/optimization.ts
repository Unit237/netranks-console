export interface Question {
  Id: number;
  Text: string;
}

export interface Brand {
  Id: number;
  Name: string;
}

export interface Citation {
  Id: number;
  Name: string;
}

export interface ModelItem {
  Id: number;
  Model: string;
  AiAgent: string;
}

export interface FilterResponse {
  Questions: Question[];
  Brands: Brand[];
  Citations: Citation[];
  Models: ModelItem[];
}

export interface CreateSearchPayload {
  StartDate: Date | undefined;
  EndDate: Date | undefined;
  QuestionIds: number[];
  BrandId: number | undefined;
  BrandName: string | undefined;
  ModelIds: number[];
}

export interface BatchPredictionRequest {
  items: BatchPredictionItem[];
}

export interface BatchPredictionItem {
  question_text: string;
  suggest_name: string;
  url_title: string;
  url: string;
  current_rank?: number; // optional because some items don't include it
  model_name?: string; // optional because only one item includes it
}
