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
  WebsiteOfTheBrand: string | null;
  iterations?: number;
  runsPerMonth?: number;
};
