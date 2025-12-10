import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTabs } from "../../console/context/TabContext";
import type { BrandData } from "../@types";
import { useBrand } from "../context/BrandContext";
import ConsoleQuestionSection from "../refactor/ConsoleQuestionSection";
import ConsoleReviewAndRefine from "../refactor/ConsoleReviewAndRefine";
import {
  fetchBrandQuestions,
  fetchQueryQuestions,
} from "../services/brandService";

const PricingAndQuestion: React.FC = () => {
  const {
    selectedBrand,
    setSelectedBrand,
    query,
    setQuery: setQueryState,
  } = useBrand();
  const navigate = useNavigate();
  const { activeTabId, updateTabName } = useTabs();

  const [survey, setSurvey] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate that we have data to fetch
    if (!selectedBrand && !query) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        let surveyData: BrandData;

        if (selectedBrand) {
          surveyData = await fetchBrandQuestions(selectedBrand);
        } else if (query) {
          surveyData = await fetchQueryQuestions(query);
        } else {
          throw new Error("No data available to fetch survey");
        }

        setSurvey(surveyData);

        if (surveyData.BrandName || surveyData.DescriptionOfTheBrandShort) {
          handleUpdateTabName(
            surveyData.BrandName ??
              surveyData.DescriptionOfTheBrandShort ??
              "New Survey"
          );
        }

        // Update brand description if available
        if (selectedBrand && surveyData.DescriptionOfTheBrandShort) {
          setSelectedBrand({
            ...selectedBrand,
            description: surveyData.DescriptionOfTheBrandShort,
          });
        }
      } catch (error) {
        console.error("Failed to fetch survey data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load questions. Please try again.";
        setError(errorMessage);
        setSurvey(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedBrand, query, navigate, setSelectedBrand, setQueryState]);

  const handleUpdateTabName = (tabName: string) => {
    if (!activeTabId) {
      return;
    }

    updateTabName(activeTabId!, tabName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!survey) {
    return <div>No survey data available</div>;
  }

  return (
    <div>
      <ConsoleReviewAndRefine survey={survey} />
      <ConsoleQuestionSection survey={survey} />
    </div>
  );
};

export default PricingAndQuestion;
