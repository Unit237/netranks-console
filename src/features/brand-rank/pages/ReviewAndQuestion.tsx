import { useCallback, useEffect, useRef, useState } from "react";
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
  const isFetchingRef = useRef<boolean>(false);
  // Guard: Track the last brandId/query we updated context for to prevent re-triggering effect
  // Root cause: setSelectedBrand context update causes re-render, which retriggers effect
  const lastUpdatedBrandIdRef = useRef<string | null>(null);
  const lastUpdatedQueryRef = useRef<string | null>(null);

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

    // Prevent concurrent requests FIRST - if already fetching, don't start another
    // This must be checked before anything else to prevent race conditions
    if (isFetchingRef.current) {
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

    // Set refs IMMEDIATELY and synchronously before any async operations
    // This prevents the effect from running again with the same data
    if (selectedBrand) {
      lastFetchedBrandIdRef.current = selectedBrand.brandId;
      lastFetchedQueryRef.current = null;
      // Reset update guard when fetching new brand
      lastUpdatedBrandIdRef.current = null;
    } else if (query) {
      lastFetchedQueryRef.current = query;
      lastFetchedBrandIdRef.current = null;
      // Reset update guard when fetching new query
      lastUpdatedQueryRef.current = null;
    }

    // Set fetching flag immediately to prevent duplicate calls
    isFetchingRef.current = true;

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
        setQuestionCount(surveyData.Questions?.length || 0);

        if (surveyData.BrandName || surveyData.DescriptionOfTheBrandShort) {
          handleUpdateTabName(
            surveyData.BrandName ??
              surveyData.DescriptionOfTheBrandShort ??
              "New Survey"
          );
        }

        // Guard: Only update selectedBrand once per fetch to prevent context update retriggering effect
        // Root cause: Context update (setSelectedBrand) causes re-render, which can retrigger useEffect
        // Fix: Track what we've already updated to ensure we only call setSelectedBrand once per fetch
        if (
          selectedBrand &&
          surveyData.DescriptionOfTheBrandShort &&
          selectedBrand.description !== surveyData.DescriptionOfTheBrandShort &&
          lastUpdatedBrandIdRef.current !== selectedBrand.brandId
        ) {
          lastUpdatedBrandIdRef.current = selectedBrand.brandId;
          lastUpdatedQueryRef.current = null;
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
        
        // Reset refs on error so it can retry
        if (selectedBrand) {
          lastFetchedBrandIdRef.current = null;
          lastUpdatedBrandIdRef.current = null;
        } else if (query) {
          lastFetchedQueryRef.current = null;
          lastUpdatedQueryRef.current = null;
        }
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    })();
  }, [
    selectedBrand?.brandId,
    query,
    navigate,
    handleUpdateTabName,
    // Removed setSelectedBrand from dependencies to prevent effect retrigger
    // Root cause: setSelectedBrand in deps + calling it inside effect creates re-render loop
    // Fix: Guard ensures we only call setSelectedBrand once per fetch via lastUpdatedBrandIdRef
  ]);

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
