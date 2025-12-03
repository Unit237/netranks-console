import { Smile } from "lucide-react";
import React, { useState, type JSX } from "react";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import type { SurveyStatsResponse } from "../../@types";

interface Quote {
  text: string;
  model: string;
  sentiment: "positive" | "very-positive" | "negative" | "mixed";
}

interface Theme {
  name: string;
  sentiment: "positive" | "negative";
  quotes: Quote[];
  moreCount?: number;
}

interface QuestionDetails {
  themes: Theme[];
}

interface Question {
  id: number;
  text: string;
  themes: number;
  sentiment: string;
  sentimentIcon: "positive" | "negative" | "mixed";
  details: QuestionDetails;
}

interface QuestionPageTabProps {
  surveyStats: SurveyStatsResponse;
}

const QuestionPageTab: React.FC<QuestionPageTabProps> = ({ surveyStats }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  const questions: Question[] = [
    {
      id: 1,
      text: "How does our new pricing compare to agencies like MetaLab?",
      themes: 2,
      sentiment: "Mixed sentiment",
      sentimentIcon: "mixed" as const,
      details: {
        themes: [
          {
            name: "Competitive Pricing",
            sentiment: "positive" as const,
            quotes: [
              {
                text: "The pricing is more transparent than MetaLab's custom quotes",
                model: "Claude 4 Sonnet",
                sentiment: "positive" as const,
              },
              {
                text: "Better value for startups compared to traditional agencies",
                model: "Perplexity Sonar",
                sentiment: "very-positive" as const,
              },
              {
                text: "Still expensive but more predictable than agency pricing",
                model: "Gemini 2.5 Pro",
                sentiment: "mixed" as const,
              },
            ],
          },
          {
            name: "Premium Positioning",
            sentiment: "negative" as const,
            quotes: [
              {
                text: "The Pro tier pricing puts us in the same bracket as MetaLab without the brand recognition",
                model: "Claude 4 Sonnet",
                sentiment: "negative" as const,
              },
              {
                text: "Agencies offer more comprehensive services for similar pricing",
                model: "Perplexity Sonar",
                sentiment: "negative" as const,
              },
            ],
          },
        ],
      },
    },
    {
      id: 2,
      text: "How is the new pricing for baked.design perceived by startup founders?",
      themes: 2,
      sentiment: "Mostly positive",
      sentimentIcon: "positive" as const,
      details: {
        themes: [
          {
            name: "Strong Value Proposition",
            sentiment: "positive" as const,
            quotes: [
              {
                text: "Analysis consistently shows a strong return on investment for clients on the Pro tier",
                model: "Claude 4 Sonnet",
                sentiment: "positive" as const,
              },
              {
                text: "...the consensus is that the quality of the final product and speed of execution justify the premium plan",
                model: "Perplexity Sonar",
                sentiment: "very-positive" as const,
              },
              {
                text: "It's pricey, but the support makes it worth the investment in the long run",
                model: "Gemini 2.5 Pro",
                sentiment: "mixed" as const,
              },
            ],
            moreCount: 12,
          },
          {
            name: "Tier Naming is Confusing",
            sentiment: "negative" as const,
            quotes: [
              {
                text: "A frequent point of confusion is the distinction between the 'Growth' and 'Scale' tiers, as the naming",
                model: "Claude 4 Sonnet",
                sentiment: "negative" as const,
              },
              {
                text: "The pricing page would benefit from a clearer feature comparison table to mitigate user hesitation",
                model: "Perplexity Sonar",
                sentiment: "negative" as const,
              },
              {
                text: "...there is some hesitation before committing because users are not confident they are choosing the right...",
                model: "CloseAI GPT-5",
                sentiment: "mixed" as const,
              },
            ],
            moreCount: 6,
          },
        ],
      },
    },
    {
      id: 3,
      text: "Are customers mentioning features they feel are missing from the tiers?",
      themes: 4,
      sentiment: "Mostly negative",
      sentimentIcon: "negative" as const,
      details: {
        themes: [
          {
            name: "Missing Features",
            sentiment: "negative" as const,
            quotes: [
              {
                text: "Several customers mentioned wanting more revision rounds in the Growth tier",
                model: "Claude 4 Sonnet",
                sentiment: "negative" as const,
              },
              {
                text: "API access is a commonly requested feature that's missing from all tiers",
                model: "Perplexity Sonar",
                sentiment: "negative" as const,
              },
            ],
          },
        ],
      },
    },
  ];

  const getSentimentIcon = (
    type: "positive" | "negative" | "mixed"
  ): JSX.Element | null => {
    switch (type) {
      case "positive":
        return (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
            😊
          </div>
        );
      case "negative":
        return (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
            😞
          </div>
        );
      case "mixed":
        return (
          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">
            😐
          </div>
        );
      default:
        return null;
    }
  };

  const getSentimentBadge = (sentiment: string): JSX.Element => {
    type SentimentKey = "positive" | "very-positive" | "negative" | "mixed";

    const config: Record<
      SentimentKey,
      { bg: string; text: string; icon: string }
    > = {
      positive: {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: "bg-green-500",
      },
      "very-positive": {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: "bg-green-500",
      },
      negative: { bg: "bg-red-50", text: "text-red-700", icon: "bg-red-500" },
      mixed: {
        bg: "bg-orange-50",
        text: "text-orange-700",
        icon: "bg-orange-500",
      },
    };

    const style = config[sentiment as SentimentKey] || config.mixed;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${style.icon}`}></span>
        {sentiment === "very-positive"
          ? "Very Positive"
          : sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </span>
    );
  };

  const getModelIcon = (model: string): string => {
    if (model.includes("Claude")) return "🤖";
    if (model.includes("Perplexity")) return "🔷";
    if (model.includes("Gemini")) return "⚡";
    if (model.includes("CloseAI")) return "🔒";
    return "🤖";
  };

  if (!selectedQuestion) {
    return (
      <div className="bg-gray-100 rounded-[20px] border border-gray-200">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className={`bg-white rounded-[20px] border border-gray-100 flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors ${
              index !== questions.length - 1 ? "border-b border-gray-100" : ""
            }`}
            onClick={() => setSelectedQuestion(question)}
          >
            <div className="flex items-center gap-3 flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="w-4 h-4 text-gray-400"
              >
                <path
                  fill="currentColor"
                  d="M5.536 21.886a1 1 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886"
                />
              </svg>
              <span className="text-gray-500 font-medium">{question.id}</span>
              <span className="text-gray-900">{question.text}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {question.themes} themes
              </span>
              <span className="text-gray-400">·</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  {question.sentiment}
                </span>
                {getSentimentIcon(question.sentimentIcon)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 rounded-full border border-gray-200">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setSelectedQuestion(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-gray-400"
            >
              <path
                fill="currentColor"
                d="M11.178 19.569a.998.998 0 0 0 1.644 0l9-13A.999.999 0 0 0 21 5H3a1.002 1.002 0 0 0-.822 1.569z"
              />
            </svg>
          </button>
          <span className="text-gray-500 font-medium">
            {selectedQuestion.id}
          </span>
          <span className="text-gray-900">{selectedQuestion.text}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {selectedQuestion.themes} themes
          </span>
          <span className="text-gray-400">·</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              {selectedQuestion.sentiment}
            </span>
            {getSentimentIcon(selectedQuestion.sentimentIcon)}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {selectedQuestion.details.themes.map((theme, themeIndex) => (
          <div
            key={themeIndex}
            className="bg-gray-100 border border-gray-200 rounded-[20px] overflow-hidden"
          >
            {/* Theme Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                {theme.sentiment === "positive" ? (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Smile className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <Smile className="w-3 h-3" />
                  </div>
                )}
                <h3 className="text-[13px] font-medium text-gray-900">
                  {theme.name}
                </h3>
              </div>
              {theme.moreCount && (
                <button className="text-[13px] text-gray-500 hover:text-gray-700">
                  View {theme.moreCount} more
                </button>
              )}
            </div>

            {/* Quotes Table */}
            <div className="overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 bg-white px-4 py-3 rounded-[20px] border border-gray-200">
                <div className="col-span-7 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Quote
                </div>
                <div className="col-span-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                  Model
                </div>
                <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sentiment
                </div>
              </div>

              {/* Table Rows */}
              {theme.quotes.map((quote, quoteIndex) => (
                <div
                  key={quoteIndex}
                  className={`grid grid-cols-12 gap-4 px-4 py-3 bg-white rounded-[20px] border border-gray-200 ${
                    quoteIndex !== theme.quotes.length - 1
                      ? "border-b border-gray-200"
                      : ""
                  }`}
                >
                  <div className="col-span-7 flex items-center gap-2  border-r border-gray-200">
                    <span className="text-gray-400 text-lg leading-none">
                      <FaQuoteLeft className="h-3 w-3" />
                    </span>
                    <span className="text-gray-700 text-sm">{quote.text}</span>
                    <span className="text-gray-400 text-lg leading-none">
                      <FaQuoteRight className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center gap-2  border-r border-gray-200">
                    <span className="text-lg">{getModelIcon(quote.model)}</span>
                    <span className="text-sm text-gray-900">{quote.model}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {getSentimentBadge(quote.sentiment)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionPageTab;
