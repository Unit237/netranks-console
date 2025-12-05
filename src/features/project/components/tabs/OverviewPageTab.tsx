import SampleAiAnswerSnippet from "../../../dashboard/components/SampleAiAnswerSnippet";
import type { SurveyDetails } from "../../@types";
import RankedBrandList from "../TopBrandsInAiAnswers";
import TopCitationAnswer from "../TopCitationAnswer";
import VisibilityItem from "../VisibilityItem";
import VisibilityTable from "../VisibilityTable";

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

      <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 w-[41.5vw]">
        {/* Metrics Row */}

        <div className="grid grid-cols-2">
          <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Brands Identified
            </p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
              {surveyDetails.Dashboard.SurveyStatsOverview.BrandsIdentified}
            </p>
          </div>
          <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-3">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Queries Run
            </p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
              {surveyDetails.Dashboard.SurveyStatsOverview.QueriesRun}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <RankedBrandList items={surveyDetails.Dashboard.TopBrandsInAiAnswers} />

        <TopCitationAnswer
          items={surveyDetails.Dashboard.TopCitationsInAiAnswers}
        />
      </div>

      {/* Baked Design Mentions */}
      <VisibilityItem mention={surveyDetails.Dashboard.VisibilityTable} />

      <SampleAiAnswerSnippet
        aiAnswer={surveyDetails.Dashboard.SampleAiAnswerSnippets}
      />

      {/* <VisibilityTrendsOverTime
        visibilityTrend={surveyDetails.Dashboard.VisibilityTrendsOverTime}
        filteredBrand={surveyDetails.Dashboard.FilteredBrand}
      /> */}

      <VisibilityTable
        visibilityEntries={surveyDetails.Dashboard.VisibilityTable}
      />

      {/* <AiVisibilityScoreChooseYourBrandToTrack
        visibilityScore={surveyDetails.Dashboard.VisibilityScore}
      /> */}
    </div>
  );
};

export default OverviewPageTab;
