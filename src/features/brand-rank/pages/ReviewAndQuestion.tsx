import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingProgressBar from "../../../app/components/LoadingProgressBar";
import { useProgress } from "../../../app/shared/hooks/useProgress";
import { useTabs } from "../../console/context/TabContext";
import type { BrandData } from "../@types";
import { useBrand } from "../context/BrandContext";
import ConsoleQuestionSection from "../refactor/ConsoleQuestionSection";
import ConsoleReviewAndRefine from "../refactor/ConsoleReviewAndRefine";
import {
  fetchBrandQuestions,
  fetchQueryQuestions,
} from "../services/brandService";

const ReviewAndQuestion: React.FC = () => {
  const { selectedBrand, setSelectedBrand, query } = useBrand();
  const navigate = useNavigate();
  const { activeTabId, updateTabName } = useTabs();

  const [survey, setSurvey] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [currentQuestions, setCurrentQuestions] = useState<string[]>([]);
  const lastFetchedBrandIdRef = useRef<string | null>(null);
  const lastFetchedQueryRef = useRef<string | null>(null);

  // Use progress hook for progress tracking
  const {
    progress,
    setProgress,
    startTimeBasedProgress,
    stopTimeBasedProgress,
  } = useProgress({
    estimatedDuration: 5000,
    maxProgressBeforeComplete: 95,
  });

  const handleUpdateTabName = useCallback(
    (tabName: string) => {
      if (!activeTabId) {
        return;
      }

      updateTabName(activeTabId!, tabName);
    },
    [activeTabId, updateTabName]
  );

  const handleQuestionCountChange = useCallback((count: number) => {
    setQuestionCount(count);
  }, []);

  const handleQuestionsChange = useCallback((questions: string[]) => {
    setCurrentQuestions(questions);
  }, []);

  useEffect(() => {
    // Validate that we have data to fetch
    if (!selectedBrand && !query) {
      navigate("/console");
      return;
    }

    // Determine what we're fetching
    const brandId = selectedBrand?.brandId ?? null;
    const queryToFetch = query ?? null;

    // Skip if we've already fetched for this brand/query
    if (
      (brandId && brandId === lastFetchedBrandIdRef.current) ||
      (queryToFetch && queryToFetch === lastFetchedQueryRef.current && !brandId)
    ) {
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        setProgress(0);

        // Stage 1: Initializing request (0-10%)
        setProgress(5);
        await new Promise(resolve => setTimeout(resolve, 50));

        // Stage 2: Sending request (10-20%)
        setProgress(15);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Stage 3: Server processing - progress based on elapsed time
        startTimeBasedProgress(20, 95);

        // Stage 4: Receiving response - this is the actual API call
        let surveyData: BrandData;
        if (selectedBrand) {
          surveyData = await fetchBrandQuestions(selectedBrand);
          lastFetchedBrandIdRef.current = selectedBrand.brandId;
          lastFetchedQueryRef.current = null;
        } else if (query) {
          surveyData = await fetchQueryQuestions(query);
          lastFetchedQueryRef.current = query;
          lastFetchedBrandIdRef.current = null;
        } else {
          throw new Error("No data available to fetch survey");
        }

        // Stop time-based progress and set to 95%
        stopTimeBasedProgress();
        setProgress(95);

        setSurvey(surveyData);
        setQuestionCount(surveyData.Questions?.length || 0);

        if (surveyData.BrandName || surveyData.DescriptionOfTheBrandShort) {
          handleUpdateTabName(
            surveyData.BrandName ??
              surveyData.DescriptionOfTheBrandShort ??
              "New Survey"
          );
        }

        // Only update selectedBrand if description actually changed
        if (selectedBrand && surveyData.DescriptionOfTheBrandShort) {
          const newDescription = surveyData.DescriptionOfTheBrandShort;
          if (selectedBrand.description !== newDescription) {
            setSelectedBrand({
              ...selectedBrand,
              description: newDescription,
            });
          }
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
        // Stop time-based progress if still running
        stopTimeBasedProgress();
        // Complete progress to 100% before hiding
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    })();
  }, [
    selectedBrand?.brandId,
    query,
    navigate,
    setSelectedBrand,
    handleUpdateTabName,
    setProgress,
    startTimeBasedProgress,
    stopTimeBasedProgress,
  ]);

  if (loading) {
    return <LoadingProgressBar progress={progress} message="Loading questions..." />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!survey) {
    return <div>No survey data available</div>;
  }

  return (
    <div className="flex h-full w-full bg-white items-start justify-center space-x-8 py-20">
      <ConsoleReviewAndRefine
        survey={survey}
        questionCount={questionCount}
        questions={currentQuestions}
      />
      <ConsoleQuestionSection
        survey={survey}
        onQuestionCountChange={handleQuestionCountChange}
        onQuestionsChange={handleQuestionsChange}
      />
    </div>
  );
};

export default ReviewAndQuestion;
