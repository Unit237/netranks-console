import type { Survey, UserData } from "../../features/auth/@types";
import type { BrandData } from "../../features/brand-rank/@types";

export const surveys: Survey[] = [
  {
    Id: 1,
    Name: "Daily Pulse - Social Media Sentiment",
    DescriptionShort:
      "Tracks daily perception trends across major social platforms.",
    SchedulePeriodHours: 24,
    Status: "Active",
    Schedule: "Daily",
    LastRun: "15 mins ago",
    Cost: "$1200/pm",
    HasIndicator: false,
  },
  {
    Id: 2,
    Name: "Q3 Brand Report",
    DescriptionShort: "Weekly brand visibility and sentiment tracking.",
    SchedulePeriodHours: 168,
    Status: "Active",
    Schedule: "Weekly",
    LastRun: "2 hours ago",
    Cost: "$200/pm",
    HasIndicator: true,
  },
  {
    Id: 3,
    Name: "Q2 2025 Competitor Analysis",
    DescriptionShort: "Competitor sentiment benchmarking and insights.",
    SchedulePeriodHours: 168,
    Status: "Paused",
    Schedule: "Weekly",
    LastRun: "3 months ago",
    Cost: "$200/pm",
    HasIndicator: true,
  },
  {
    Id: 4,
    Name: "Ad Campaign Pre-Launch Analysis",
    DescriptionShort: "Single-run campaign performance prediction.",
    SchedulePeriodHours: 0,
    Status: "Error",
    Schedule: "Single Run",
    LastRun: "Failed",
    Cost: "$25/pm",
    HasIndicator: true,
  },
  {
    Id: 5,
    Name: "FFFFFF Head-to-Head",
    DescriptionShort: "Brand matchups and audience preference comparisons.",
    SchedulePeriodHours: 168,
    Status: "Active",
    Schedule: "Weekly",
    LastRun: "2 weeks ago",
    Cost: "$200/pm",
    HasIndicator: false,
  },
];

export const DUMMY_USER: UserData = {
  Id: 149,
  Name: "John Doe",
  EMail: "john.doe@example.com",
  Projects: [
    {
      Id: 161,
      Name: "Marketing Insights Dashboard",
      IsActive: true,
      IsOwner: true,
      IsEditor: true,
      Surveys: surveys, // All surveys
    },
    {
      Id: 162,
      Name: "Brand Monitoring Suite",
      IsActive: true,
      IsOwner: false,
      IsEditor: true,
      Surveys: surveys.slice(0, 3), // Some surveys
    },
    {
      Id: 163,
      Name: "Competitor Watchlist",
      IsActive: false,
      IsOwner: false,
      IsEditor: false,
      Surveys: surveys.slice(2, 5), // Subset
    },
    {
      Id: 1110,
      Name: "Text survey",
      IsActive: true,
      IsOwner: false,
      IsEditor: false,
      Surveys: [],
    },
  ],
};

export const BRAND_DATA: BrandData[] = [
  {
    Id: 1,
    BrandName: "Netranks AI",
    DescriptionOfTheBrand:
      "An AI-powered analytics platform that helps businesses understand brand perception and market trends.",
    DescriptionOfTheBrandShort: "AI analytics platform.",
    DescriptionOfTheQuestion:
      "Collects insights about the brand’s overall performance, user sentiment, and awareness across key online platforms.",
    DescriptionOfTheQuestionShort: "General brand perception questions.",
    QueryType: "SentimentAnalysis",
    PasswordOne: null,
    PasswordTwo: null,
    WebsiteOfTheBrand: "https://netranks.ai",
    iterations: 30,
    runsPerMonth: 12,
    Questions: [
      "What do people think about Netranks AI in the last 30 days?",
      "How recognizable is the Netranks AI brand across social platforms?",
      "What are users saying about Netranks AI's features?",
    ],
  },
  {
    Id: 2,
    BrandName: "Mellon Bank",
    DescriptionOfTheBrand:
      "A digital-only neobank focused on quick payments and simple personal banking.",
    DescriptionOfTheBrandShort: "Digital neobank.",
    DescriptionOfTheQuestion:
      "Evaluates user trust, ease of use, and reliability of the bank’s digital services.",
    DescriptionOfTheQuestionShort: "User trust and experience.",
    QueryType: "MarketResearch",
    PasswordOne: "secure*pass",
    PasswordTwo: "secure*pass",
    WebsiteOfTheBrand: "https://mellonbank.com",
    iterations: 15,
    runsPerMonth: 4,
    Questions: [
      "How much do customers trust Mellon Bank for daily financial transactions?",
      "What features of Mellon Bank do users like the most?",
    ],
  },
  {
    Id: 3,
    BrandName: "Timbu Travel",
    DescriptionOfTheBrand:
      "A modern travel booking platform designed to simplify international travel planning.",
    DescriptionOfTheBrandShort: "Travel booking platform.",
    DescriptionOfTheQuestion:
      "Assesses user interest in new destinations, pricing feedback, and how the platform compares to competitors.",
    DescriptionOfTheQuestionShort:
      "Travel preferences & competitor comparison.",
    QueryType: "ConsumerInsights",
    PasswordOne: null,
    PasswordTwo: null,
    WebsiteOfTheBrand: "https://timbu.com",
    iterations: 20,
    runsPerMonth: 8,
    Questions: [
      "Which destinations are most searched by Timbu Travel users this month?",
      "What do users think about Timbu's pricing structure?",
      "How does Timbu Travel compare to Booking.com or Airbnb?",
    ],
  },
  {
    Id: 4,
    BrandName: "DS9 Electronics",
    DescriptionOfTheBrand:
      "A consumer electronics company specializing in smart devices and IoT hardware.",
    DescriptionOfTheBrandShort: "Smart device manufacturer.",
    DescriptionOfTheQuestion:
      "Explores user opinions around device performance, durability, and technological innovation.",
    DescriptionOfTheQuestionShort: "Product performance & innovation.",
    QueryType: "ProductFeedback",
    PasswordOne: "ds9-1234",
    PasswordTwo: "ds9-1234",
    WebsiteOfTheBrand: "https://ds9tech.com",
    iterations: 10,
    runsPerMonth: 2,
    Questions: [
      "How do users rate the durability of DS9 devices?",
      "What features are users requesting in upcoming DS9 releases?",
    ],
  },
];
