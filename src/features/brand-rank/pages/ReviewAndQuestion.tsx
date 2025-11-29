import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTabs } from "../../console/context/TabContext";
import type { BrandData, Question } from "../@types";
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
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const lastFetchedBrandIdRef = useRef<string | null>(null);
  const lastFetchedQueryRef = useRef<string | null>(null);

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

  const handleQuestionsChange = useCallback((questions: Question[]) => {
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
        setLoading(false);
      }
    })();
  }, [
    selectedBrand?.brandId,
    query,
    navigate,
    setSelectedBrand,
    handleUpdateTabName,
  ]);

  if (loading) {
    return <div>Loading...</div>;
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
