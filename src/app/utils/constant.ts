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
      Name: "Test survey",
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
      "An AI-driven analytics platform that helps brands understand public perception and track sentiment in real-time.",
    DescriptionOfTheBrandShort: "AI analytics for brand insights.",
    DescriptionOfTheQuestion:
      "General brand perception queries used to measure visibility, sentiment, awareness, and conversation trends.",
    DescriptionOfTheQuestionShort: "General brand sentiment questions.",
    QueryType: "SentimentAnalysis",
    PasswordOne: null,
    PasswordTwo: null,
    WebsiteOfTheBrand: "https://netranks.ai",
    iterations: 30,
    runsPerMonth: 12,
    Questions: [
      "What do people think about Netranks AI this month? How much do customers trust Mellon Bank with their finances.",
      "How recognizable is the Netranks AI brand across social media?",
      "What are users saying about Netranks AI’s new product features?when using the Mellon Bank mobile app",
      "How much do customers trust Mellon Bank with their finances?",
      "What features do customers value most in Mellon Bank? when using the Mellon Bank mobile app.",
      "What common issues do users face when using the Mellon Bank mobile app?",
    ],
  },
  {
    Id: 2,
    BrandName: "Mellon Bank",
    DescriptionOfTheBrand:
      "A fully digital bank offering personal accounts, instant transfers, and simplified financial services.",
    DescriptionOfTheBrandShort: "A modern digital bank.",
    DescriptionOfTheQuestion:
      "Questions related to user trust, usage patterns, and overall customer satisfaction with Mellon Bank.",
    DescriptionOfTheQuestionShort: "Trust & customer experience.",
    QueryType: "MarketResearch",
    PasswordOne: "bank-001",
    PasswordTwo: "bank-001",
    WebsiteOfTheBrand: "https://mellonbank.com",
    iterations: 15,
    runsPerMonth: 6,
    Questions: [
      "How much do customers trust Mellon Bank with their finances?",
      "What features do customers value most in Mellon Bank?",
      "What common issues do users face when using the Mellon Bank mobile app?",
    ],
  },
  {
    Id: 3,
    BrandName: "Timbu Travel",
    DescriptionOfTheBrand:
      "A global booking service that simplifies flights, hotels, and travel planning for millions of users.",
    DescriptionOfTheBrandShort: "Travel booking and itinerary platform.",
    DescriptionOfTheQuestion:
      "Travel preference questions that measure destination interest, price sensitivity, and booking behavior.",
    DescriptionOfTheQuestionShort: "Travel insights & preferences.",
    QueryType: "ConsumerInsights",
    PasswordOne: null,
    PasswordTwo: null,
    WebsiteOfTheBrand: "https://timbu.com",
    iterations: 20,
    runsPerMonth: 8,
    Questions: [
      "Which destinations are gaining interest among Timbu Travel users?",
      "How do users feel about Timbu’s pricing compared to competitors?",
      "What factors influence users most when booking a trip?",
    ],
  },
  {
    Id: 4,
    BrandName: "DS9 Electronics",
    DescriptionOfTheBrand:
      "A global electronics company known for innovative smart gadgets, IoT devices, and consumer tech.",
    DescriptionOfTheBrandShort: "Smart device and electronics manufacturer.",
    DescriptionOfTheQuestion:
      "Questions measuring device satisfaction, durability, innovation, and customer expectations.",
    DescriptionOfTheQuestionShort: "Product durability & innovation.",
    QueryType: "ProductFeedback",
    PasswordOne: "ds9tech",
    PasswordTwo: "ds9tech",
    WebsiteOfTheBrand: "https://ds9tech.com",
    iterations: 10,
    runsPerMonth: 3,
    Questions: [
      "How do users rate the durability of DS9 devices?",
      "Which new features are most requested by DS9 customers?",
      "How does DS9 compare to other electronics brands?",
    ],
  },
  {
    Id: 5,
    BrandName: "Wavepay",
    DescriptionOfTheBrand:
      "A mobile-first payment service offering instant transfers, bill payments, and QR-based transactions.",
    DescriptionOfTheBrandShort: "Mobile payments made simple.",
    DescriptionOfTheQuestion:
      "Questions focused on user satisfaction, transaction reliability, and service adoption.",
    DescriptionOfTheQuestionShort: "Payment reliability insights.",
    QueryType: "UserExperience",
    PasswordOne: null,
    PasswordTwo: null,
    WebsiteOfTheBrand: "https://wavepay.io",
    iterations: 12,
    runsPerMonth: 5,
    Questions: [
      "Are Wavepay transactions reliable compared to competitors?",
      "What frustrates users most when using Wavepay?",
      "What features do users want added to Wavepay?",
    ],
  },
  {
    Id: 6,
    BrandName: "New project",
    DescriptionOfTheBrand: "",
    DescriptionOfTheBrandShort: "",
    DescriptionOfTheQuestion: "",
    DescriptionOfTheQuestionShort: "",
    QueryType: "",
    PasswordOne: null,
    PasswordTwo: null,
    WebsiteOfTheBrand: "",
    iterations: 0,
    runsPerMonth: 0,
    Questions: [],
  },
];
