import type { Survey, UserData } from "../../features/auth/@types";
import type { BrandData } from "../../features/brand-rank/@types";

// Helper function to generate NextRunAt dates
// For testing: NextRunAt = now + hoursUntilNextRun
const getNextRunAt = (hoursUntilNextRun: number): string => {
  return new Date(Date.now() + hoursUntilNextRun * 60 * 60 * 1000).toISOString();
};

// Mock surveys matching backend GetUser SurveyDto format:
// { Id, Name, DescriptionShort, SchedulePeriodHours, NextRunAt }
// LastRunAt will be calculated as: NextRunAt - SchedulePeriodHours
export const surveys: Survey[] = [
  {
    Id: 3595,
    Name: "Owner wants steps to boost their consulting brand's search rankings and visibility.",
    DescriptionShort: "Consulting brand SEO and visibility improvement survey.",
    SchedulePeriodHours: 0, // Paused
    NextRunAt: null, // null → LastRunAt will be null (never ran or paused)
  },
  {
    Id: 1,
    Name: "Daily Pulse - Social Media Sentiment",
    DescriptionShort: "Tracks daily perception trends across major social platforms.",
    SchedulePeriodHours: 24, // Active - runs every 24 hours
    NextRunAt: getNextRunAt(24 - 0.25), // Next run in ~23.75 hours → LastRunAt = ~15 minutes ago
  },
  {
    Id: 2,
    Name: "Q3 Brand Report",
    DescriptionShort: "Weekly brand visibility and sentiment tracking.",
    SchedulePeriodHours: 168, // Active - runs every week (168 hours)
    NextRunAt: getNextRunAt(168 - 2), // Next run in ~166 hours → LastRunAt = ~2 hours ago
  },
  {
    Id: 3,
    Name: "Q2 2025 Competitor Analysis",
    DescriptionShort: "Competitor sentiment benchmarking and insights.",
    SchedulePeriodHours: 0, // Paused
    NextRunAt: null, // null → LastRunAt will be null (paused)
  },
  {
    Id: 4,
    Name: "Ad Campaign Pre-Launch Analysis",
    DescriptionShort: "Single-run campaign performance prediction.",
    SchedulePeriodHours: 0, // Paused
    NextRunAt: null, // null → LastRunAt will be null (never ran)
  },
  {
    Id: 5,
    Name: "FFFFFF Head-to-Head",
    DescriptionShort: "Brand matchups and audience preference comparisons.",
    SchedulePeriodHours: 168, // Active - runs every week
    NextRunAt: getNextRunAt(168 - (14 * 24)), // Next run in ~0 hours → LastRunAt = ~14 days ago
  },
  // Additional test surveys for different LastRunAt scenarios
  {
    Id: 6,
    Name: "Just Now Test Survey",
    DescriptionShort: "Test survey that ran just now.",
    SchedulePeriodHours: 24, // Active
    NextRunAt: getNextRunAt(24 - (0.5 / 60)), // Next run in ~24 hours → LastRunAt = ~30 seconds ago
  },
  {
    Id: 7,
    Name: "One Hour Ago Test",
    DescriptionShort: "Test survey that ran 1 hour ago.",
    SchedulePeriodHours: 24, // Active
    NextRunAt: getNextRunAt(24 - 1), // Next run in ~23 hours → LastRunAt = ~1 hour ago
  },
  {
    Id: 8,
    Name: "One Day Ago Test",
    DescriptionShort: "Test survey that ran 1 day ago.",
    SchedulePeriodHours: 24, // Active
    NextRunAt: getNextRunAt(24 - 24), // Next run in ~0 hours → LastRunAt = ~1 day ago
  },
  {
    Id: 9,
    Name: "Three Days Ago Test",
    DescriptionShort: "Test survey that ran 3 days ago.",
    SchedulePeriodHours: 24, // Active
    NextRunAt: getNextRunAt(24 - (3 * 24)), // Next run in ~0 hours → LastRunAt = ~3 days ago
  },
  {
    Id: 10,
    Name: "Six Days Ago Test",
    DescriptionShort: "Test survey that ran 6 days ago.",
    SchedulePeriodHours: 24, // Active
    NextRunAt: getNextRunAt(24 - (6 * 24)), // Next run in ~0 hours → LastRunAt = ~6 days ago
  },
  {
    Id: 11,
    Name: "Never Run Survey",
    DescriptionShort: "Test survey that has never run.",
    SchedulePeriodHours: 24, // Active
    NextRunAt: null, // null → LastRunAt will be null (never ran)
  },
  {
    Id: 12,
    Name: "Paused Never Run",
    DescriptionShort: "Paused survey that has never run.",
    SchedulePeriodHours: 0, // Paused
    NextRunAt: null, // null → LastRunAt will be null (paused)
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
