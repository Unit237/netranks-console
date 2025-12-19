import { useEffect, useRef, useState } from "react";
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
  const [progress, setProgress] = useState<number>(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Validate that we have data to fetch
    if (!selectedBrand && !query) {
      navigate("/");
      return;
    }

    (async () => {
      let processingInterval: NodeJS.Timeout | null = null;
      
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Track request lifecycle stages
        const updateProgress = (stage: number) => {
          setProgress(stage);
        };

        // Stage 1: Initializing request (0-10%)
        updateProgress(5);
        await new Promise(resolve => setTimeout(resolve, 50));

        // Stage 2: Sending request (10-20%)
        updateProgress(15);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Stage 3: Server processing - progress based on elapsed time
        const startTime = Date.now();
        const estimatedDuration = 5000; // Estimate 5 seconds for API call
        let processingProgress = 20;
        
        processingInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          // Calculate progress based on elapsed time, capping at 95% until response
          const timeBasedProgress = Math.min(20 + (elapsed / estimatedDuration) * 75, 95);
          // Use the higher of time-based or current progress to prevent going backwards
          processingProgress = Math.max(processingProgress, timeBasedProgress);
          updateProgress(Math.min(processingProgress, 95));
        }, 100);

        // Stage 4: Receiving response - this is the actual API call
        let surveyData: BrandData;
        if (selectedBrand) {
          surveyData = await fetchBrandQuestions(selectedBrand);
        } else if (query) {
          surveyData = await fetchQueryQuestions(query);
        } else {
          throw new Error("No data available to fetch survey");
        }

        // Clear processing interval
        if (processingInterval) {
          clearInterval(processingInterval);
          processingInterval = null;
        }
        updateProgress(95);

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
        // Clear any intervals
        if (processingInterval) {
          clearInterval(processingInterval);
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        // Complete progress to 100% before hiding
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    })();
  }, [selectedBrand, query, navigate, setSelectedBrand, setQueryState]);

  const handleUpdateTabName = (tabName: string) => {
    if (!activeTabId) {
      return;
    }

    updateTabName(activeTabId!, tabName);
  };

  // Cleanup progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading questions...</p>
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{Math.round(progress)}%</p>
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
      <ConsoleReviewAndRefine 
        survey={survey} 
        questionCount={survey.Questions?.length || 0}
        questions={survey.Questions || []}
      />
      <ConsoleQuestionSection survey={survey} />
    </div>
  );
};

export default PricingAndQuestion;
