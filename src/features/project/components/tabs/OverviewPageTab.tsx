import SampleAiAnswerSnippet from "../../../dashboard/components/SampleAiAnswerSnippet";
import type { SurveyDetails } from "../../@types";
import AiVisibilityScoreChooseYourBrandToTrack from "../AiVisibilityScoreChooseYourBrandToTrack";
import RankedBrandList from "../TopBrandsInAiAnswers";
import VisibilityItem from "../VisibilityItem";
import VisibilityTable from "../VisibilityTable";
import VisibilityTrendsOverTime from "../VisibilityTrendsOverTime";

interface OverviewPageTabProps {
  surveyDetails: SurveyDetails;
}

const OverviewPageTab: React.FC<OverviewPageTabProps> = ({ surveyDetails }) => {
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

  return (
    <div className="space-y-6">
      {/* Sentiment Summary Card */}

      <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Metrics Row */}

        <div className="grid grid-cols-3">
          {/* <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
              Sentiment
            </p>
            <div className="flex items-center text-lg font-semibold text-gray-600 dark:text-gray-100">
              <Menu className="text-green-600 mr-1" /> {sentimentData.overall}
            </div>
          </div> */}
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

      <RankedBrandList items={surveyDetails.Dashboard.TopBrandsInAiAnswers} />

      {/* Baked Design Mentions */}
      <VisibilityItem mention={surveyDetails.Dashboard.VisibilityTable} />

      <SampleAiAnswerSnippet
        aiAnswer={surveyDetails.Dashboard.SampleAiAnswerSnippets}
      />

      <VisibilityTrendsOverTime
        visibilityTrend={surveyDetails.Dashboard.VisibilityTrendsOverTime}
        filteredBrand={surveyDetails.Dashboard.FilteredBrand}
      />

      <VisibilityTable
        visibilityEntries={surveyDetails.Dashboard.VisibilityTable}
      />

      <AiVisibilityScoreChooseYourBrandToTrack
        visibilityScore={surveyDetails.Dashboard.VisibilityScore}
      />
    </div>
  );
};

export default OverviewPageTab;
