import { Eye, Infinity, Menu, Search, Smile } from "lucide-react";
import { useState } from "react";
import { AiFillApi } from "react-icons/ai";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<"Overview" | "Questions">(
    "Overview"
  );

  // Sentiment data
  const sentimentData = {
    overall: "Positive",
    mentionsAnalyzed: "11.2K",
    competitorsMentioned: "32",
    themesFound: "12",
    breakdown: [
      {
        label: "Positive",
        percentage: 68,
        count: "7.6K",
        color: "bg-green-500",
      },
      { label: "Mixed", percentage: 10, count: "1.2K", color: "bg-orange-500" },
      { label: "Negative", percentage: 22, count: "2.4K", color: "bg-red-500" },
    ],
  };

  // Sentiment over time data (weeks W1-W4)
  const sentimentOverTime = [
    { week: "W1", positive: 2, negative: 1, mixed: 0.5 },
    { week: "W2", positive: 7, negative: 2, mixed: 1 },
    { week: "W3", positive: 5, negative: 4, mixed: 1.2 },
    { week: "W4", positive: 6.5, negative: 2.5, mixed: 0.8 },
  ];

  // Industry rank data
  const industryRank = [
    {
      rank: 1,
      percentage: 38,
      name: "ffffff.design",
      mentions: "2,105",
      icon: null,
    },
    {
      rank: 2,
      percentage: 25,
      name: "Baked Design",
      mentions: "1,380",
      icon: "B",
    },
    {
      rank: 3,
      percentage: 19,
      name: "imagine.com",
      mentions: "1,050",
      icon: "∞",
    },
    {
      rank: 4,
      percentage: 11,
      name: "Ueno Studio",
      mentions: "610",
      icon: null,
    },
    { rank: 5, percentage: 7, name: "Huge Inc", mentions: "385", icon: null },
    { rank: 6, percentage: 7, name: "Huge Inc", mentions: "385", icon: "A" },
  ];

  // Baked Design mentions/questions
  const bakedDesignMentions = [
    {
      question: "How does our new pricing compare to agencies like MetaLab?",
      desc: "baked.design is positioned as more agile and founder friendly compared to the larger, established MetaLab",
      timeAgo: "1h ago",
      status: "success",
      icons: ["B", "P", "A"],
    },
    {
      question:
        "Is the value proposition of the new 'Pro' tier clear in online discussions?",
      desc: "The Pro tier s value is clearly associated with direct access to senior design partners and strategic engagement.",
      timeAgo: "2h ago",
      status: "success",
      icons: ["∞", "P", "A"],
    },
    {
      question:
        "How is the new pricing for baked.design perceived by startup founders?",
      desc: "Pricing is considered a fair investment for quality and speed, particularly among funded startups.",
      timeAgo: "2h ago",
      status: "success",
      icons: ["∞", "A", "G"],
    },
    {
      question:
        "Are customers mentioning features they feel are missing from the tiers?",
      desc: "Pricing is considered a fair investment for quality and speed, particularly among funded startups.",
      timeAgo: "3h ago",
      status: "error",
      icons: [],
    },
  ];

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...sentimentOverTime.flatMap((d) => [d.positive, d.negative, d.mixed])
  );

  return (
    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="w-full mx-auto p-6">
        {/* Header with tabs */}
        <div className="mb-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("Overview")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "Overview"
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("Questions")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "Questions"
                  ? "text-gray-900 dark:text-gray-100"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Questions
            </button>
          </div>
        </div>

        {activeTab === "Overview" && (
          <div className="space-y-6">
            {/* Sentiment Summary Card */}

            <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Metrics Row */}

              <div className="grid grid-cols-4">
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
                    Sentiment
                  </p>
                  <div className="flex items-center text-lg font-semibold text-gray-600 dark:text-gray-100">
                    <Menu className="text-green-600 mr-1" />{" "}
                    {sentimentData.overall}
                  </div>
                </div>
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
                    Mentions analyzed
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                    {sentimentData.mentionsAnalyzed}
                  </p>
                </div>
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
                    Competitors mentioned
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                    {sentimentData.competitorsMentioned}
                  </p>
                </div>
                <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
                    Themes found
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                    {sentimentData.themesFound}
                  </p>
                </div>
              </div>
            </div>

            {/* Sentiment Breakdown Bar */}
            <div className="space-y-2">
              {/* Breakdown bar */}
              <div className="flex h-[6px] rounded-md overflow-hidden">
                {sentimentData.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className={`${item.color} h-[3px] mr-1`}
                    style={{ width: `${item.percentage}%` }}
                  />
                ))}
              </div>

              {/* Labels aligned below */}
              <div className="flex w-full text-xs text-gray-600 dark:text-gray-400 pt-2">
                {sentimentData.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className="text-start px-4 border-l border-gray-500 dark:border-gray-600"
                    style={{ width: `${item.percentage}%` }}
                  >
                    <span className="block font-medium">{item.label}</span>
                    <span className="block">
                      {item.percentage}% / {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex w-full space-x-8 overflow-hidden">
              {/* Sentiment Over Time Graph */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
                  Sentiment Over Time
                </h2>
                <div className="h-[18.5rem] relative bg-white dark:bg-gray-800 p-8 rounded-[20px] overflow-hidden">
                  {/* Y-axis labels */}
                  <div className="h-[14rem] absolute left-4 top-6 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>8K</span>
                    <span>6K</span>
                    <span>4K</span>
                    <span>2K</span>
                    <span>0K</span>
                  </div>

                  {/* Chart area */}
                  <div className="ml-4 mr-2 h-[13rem] relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="border-t border-gray-200 dark:border-gray-700"
                        />
                      ))}
                    </div>

                    {/* Chart lines */}
                    <svg
                      className="absolute inset-0 w-full h-full"
                      viewBox="0 0 300 200"
                      preserveAspectRatio="none"
                    >
                      {/* Positive line (green) */}
                      <polyline
                        points={`${(0 / 3) * 300},${
                          200 - (sentimentOverTime[0].positive / maxValue) * 200
                        } ${(1 / 3) * 300},${
                          200 - (sentimentOverTime[1].positive / maxValue) * 200
                        } ${(2 / 3) * 300},${
                          200 - (sentimentOverTime[2].positive / maxValue) * 200
                        } ${(3 / 3) * 300},${
                          200 - (sentimentOverTime[3].positive / maxValue) * 200
                        }`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Negative line (red) */}
                      <polyline
                        points={`${(0 / 3) * 300},${
                          200 - (sentimentOverTime[0].negative / maxValue) * 200
                        } ${(1 / 3) * 300},${
                          200 - (sentimentOverTime[1].negative / maxValue) * 200
                        } ${(2 / 3) * 300},${
                          200 - (sentimentOverTime[2].negative / maxValue) * 200
                        } ${(3 / 3) * 300},${
                          200 - (sentimentOverTime[3].negative / maxValue) * 200
                        }`}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Mixed line (orange) */}
                      <polyline
                        points={`${(0 / 3) * 300},${
                          200 - (sentimentOverTime[0].mixed / maxValue) * 200
                        } ${(1 / 3) * 300},${
                          200 - (sentimentOverTime[1].mixed / maxValue) * 200
                        } ${(2 / 3) * 300},${
                          200 - (sentimentOverTime[2].mixed / maxValue) * 200
                        } ${(3 / 3) * 300},${
                          200 - (sentimentOverTime[3].mixed / maxValue) * 200
                        }`}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute bottom-4 left-20 right-20 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    {sentimentOverTime.map((item) => (
                      <span key={item.week}>{item.week}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Industry Rank */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 w-full">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
                  Industry Rank
                </h2>
                <div className="">
                  {industryRank.map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-center justify-between px-4 py-3 rounded-[20px] border border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-6">
                          {item.rank}.
                        </span>
                        {item.icon ? (
                          <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                            {item.icon}
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300"></div>
                        )}
                        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
                          <span className="h-6 p-2 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">
                            {item.percentage}% <Eye className="h-4 w-4 ml-1" />
                          </span>{" "}
                          {item.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.mentions} mentions
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Baked Design Mentions */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                    B
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Baked Design mentions
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 bg-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                    <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <option>
                      <svg
                        className="w-4 h-4 inline-block mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      Period
                    </option>
                  </select>
                  <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <option>
                      <AiFillApi />
                      Model
                    </option>
                  </select>
                  <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <option>
                      <svg
                        className="w-4 h-4 inline-block mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.691h3.462c.969 0 1.371 1.24.588 1.81l-2.817 2.046a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.817-2.046a1 1 0 00-1.175 0l-2.817 2.046c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.012 8.72a1 1 0 01.588-1.81h3.461a1 1 0 00.951-.691l1.07-3.292z"></path>
                      </svg>
                      Sentiment
                    </option>
                  </select>
                </div>
              </div>

              <div className="">
                {bakedDesignMentions.map((mention, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-3 rounded-[20px] border border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {mention.status === "success" ? (
                        <Smile className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Smile className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
                            {mention.question}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {mention.timeAgo}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-100 mb-1">
                          {mention.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {mention.icons.map((icon, iconIndex) => (
                        <div
                          key={iconIndex}
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                            icon === "∞"
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                              : icon === "B"
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {icon === "∞" ? (
                            <Infinity className="w-3.5 h-3.5" />
                          ) : (
                            icon
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Questions" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <p className="text-gray-600 dark:text-gray-400">
              Questions tab content
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
