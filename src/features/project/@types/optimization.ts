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
