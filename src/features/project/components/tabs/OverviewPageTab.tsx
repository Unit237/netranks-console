import SampleAiAnswerSnippet from "../../../dashboard/components/SampleAiAnswerSnippet";
import type { SurveyDetails } from "../../@types";
import RankedBrandList from "../TopBrandsInAiAnswers";
import TopCitationAnswer from "../TopCitationAnswer";
import VisibilityItem from "../VisibilityItem";
import VisibilityTable from "../VisibilityTable";
import { sanitizeSurveyName } from "../../utils/sanitizeSurveyName";

interface OverviewPageTabProps {
  surveyDetails: SurveyDetails;
}

const OverviewPageTab: React.FC<OverviewPageTabProps> = ({ surveyDetails }) => {
  // Safety check for Dashboard and its properties
  if (!surveyDetails?.Dashboard) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-300">
        Dashboard data is not available.
      </div>
    );
  }

  const dashboard = surveyDetails.Dashboard;
  const statsOverview = dashboard.SurveyStatsOverview;
  const surveyName = sanitizeSurveyName(surveyDetails.Name);

  return (
    <div className="space-y-6">
      {/* Sentiment Summary Card */}

      {statsOverview && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700 w-[41.5vw]">
          {/* Metrics Row */}

          <div className="grid grid-cols-2">
            <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Brands Identified
              </p>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                {statsOverview.BrandsIdentified ?? 0}
              </p>
            </div>
            <div className="rounded-[20px] bg-white dark:bg-gray-800 border-[0.3px] border-gray-200 dark:border-gray-700 p-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Queries Run
              </p>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">
                {statsOverview.QueriesRun ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {dashboard.TopBrandsInAiAnswers &&
        dashboard.TopBrandsInAiAnswers.length > 0 && (
          <div className="flex items-start gap-2">
            <RankedBrandList items={dashboard.TopBrandsInAiAnswers} />

            {dashboard.TopCitationsInAiAnswers && (
              <TopCitationAnswer items={dashboard.TopCitationsInAiAnswers} />
            )}
          </div>
        )}

      {/* Survey Mentions */}
      {dashboard.VisibilityTable && dashboard.VisibilityTable.length > 0 && (
        <VisibilityItem mention={dashboard.VisibilityTable} surveyName={surveyName} />
      )}

      {dashboard.SampleAiAnswerSnippets &&
        dashboard.SampleAiAnswerSnippets.length > 0 && (
          <SampleAiAnswerSnippet aiAnswer={dashboard.SampleAiAnswerSnippets} />
        )}

      {/* <VisibilityTrendsOverTime
        visibilityTrend={dashboard.VisibilityTrendsOverTime}
        filteredBrand={dashboard.FilteredBrand}
      /> */}

      {dashboard.VisibilityTable && dashboard.VisibilityTable.length > 0 && (
        <VisibilityTable visibilityEntries={dashboard.VisibilityTable} />
      )}

      {/* <AiVisibilityScoreChooseYourBrandToTrack
        visibilityScore={dashboard.VisibilityScore}
      /> */}
    </div>
  );
};

export default OverviewPageTab;
