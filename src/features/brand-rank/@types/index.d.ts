export interface BrandOption {
  brandId: string;
  icon: string;
  name: string;
  domain: string;
  claimed: boolean;
  qualityScore: number;
  verified: boolean;
  _score: number;
  description: string;
}

export type BrandData = {
  BrandName: string | null;
  DescriptionOfTheBrand: string | null;
  DescriptionOfTheBrandShort: string | null;
  DescriptionOfTheQuestion: string | null;
  DescriptionOfTheQuestionShort: string | null;
  Id: number;
  PasswordOne: string | null;
  PasswordTwo: string | null;
  QueryType: string | null;
  Questions: string[];
  QuestionIds?: number[]; // Maps Questions array index to question ID for edit/delete operations
  ProjectId?: number | null; // Project ID if survey belongs to a project, null/undefined for visitor surveys
  WebsiteOfTheBrand: string | null;
  iterations?: number;
  runsPerMonth?: number;
};

export interface Question {
  Id: number;
  Text: string;
}
