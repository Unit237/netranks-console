import { Trash2, Undo2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { v4 as uuid } from "uuid";
import type { BrandData } from "../@types";
import { BrandSurveyRunSummary } from "../components/BrandSurveyRunSummary";
import { useBrand } from "../context/BrandContext";
import {
  fetchBrandQuestions,
  fetchQueryQuestions,
  startSurvey,
} from "../services/brandService";

const Questions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paramQuestionRaw = (searchParams.get("question") ?? "").trim();
  const hasParamQuestion = paramQuestionRaw.length >= 3;
  const { selectedBrand, setSelectedBrand, query, setQuery } = useBrand();
  const navigate = useNavigate();

  // Use a stable componentId for request cancellation
  const componentIdRef = useRef<string>(uuid());
  const isMountedRef = useRef<boolean>(true);
  const fetchInProgressRef = useRef<boolean>(false);

  const [survey, setSurvey] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const [startingSurvey, setStartingSurvey] = useState<boolean>(false);
  const [deletedQuestions, setDeletedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showToast, setShowToast] = useState(false);
  const [lastDeletedQuestion, setLastDeletedQuestion] = useState<{
    index: number;
    question: string;
  } | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const questions = useMemo<string[]>(() => survey?.Questions ?? [], [survey]);

  const effectiveQuery = hasParamQuestion ? paramQuestionRaw : query;
  const displayBrand = hasParamQuestion ? null : selectedBrand ?? null;

  // Memoize the key to prevent unnecessary re-fetches
  const fetchKey = useMemo(() => {
    if (hasParamQuestion) {
      return `param-${paramQuestionRaw}-${retryTrigger}`;
    }
    if (selectedBrand) {
      return `brand-${selectedBrand.brandId}-${retryTrigger}`;
    }
    if (query) {
      return `query-${query}-${retryTrigger}`;
    }
    return null;
  }, [
    hasParamQuestion,
    paramQuestionRaw,
    selectedBrand?.brandId,
    query,
    retryTrigger,
  ]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Validate that either we have a param question or context data
    if (!hasParamQuestion && !selectedBrand && !query) {
      navigate("/");
      return;
    }

    // Prevent multiple simultaneous requests
    if (fetchInProgressRef.current) {
      return;
    }

    const fetchSurveyData = async () => {
      // Skip if component is unmounted
      if (!isMountedRef.current) {
        return;
      }

      fetchInProgressRef.current = true;
      setLoading(true);
      setError(null);

      try {
        let surveyData: BrandData | null = null;

        if (hasParamQuestion) {
          surveyData = await fetchQueryQuestions(paramQuestionRaw, {
            componentId: componentIdRef.current,
            setLoading,
          });
        } else if (selectedBrand) {
          surveyData = await fetchBrandQuestions(selectedBrand, {
            componentId: componentIdRef.current,
            setLoading,
          });
        } else if (effectiveQuery) {
          surveyData = await fetchQueryQuestions(effectiveQuery, {
            componentId: componentIdRef.current,
            setLoading,
          });
        }

        if (!surveyData) {
          throw new Error(
            "No survey data available for the current selection."
          );
        }

        // Check if component is still mounted before updating state
        // if (!isMountedRef.current) {
        //   return;
        // }

        setSurvey(surveyData);

        // Update brand description if available
        if (
          !hasParamQuestion &&
          selectedBrand &&
          surveyData.DescriptionOfTheBrandShort
        ) {
          setSelectedBrand({
            ...selectedBrand,
            description: surveyData.DescriptionOfTheBrandShort,
          });
        }

        // Clear query if this is a brand-type survey
        if (!hasParamQuestion && surveyData.QueryType === "brand") {
          setQuery("");
        }
      } catch (error) {
        // Check if component is still mounted before updating state
        if (!isMountedRef.current) {
          return;
        }

        // Ignore abort errors (cancelled requests)
        if (
          error instanceof Error &&
          (error.name === "AbortError" ||
            error.message === "Request canceled with cancel token")
        ) {
          console.log("Request was cancelled");
          return;
        }

        console.error("Failed to fetch survey data:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load questions. Please try again.";
        setError(errorMessage);
        setSurvey(null);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          fetchInProgressRef.current = false;
        }
      }
    };

    fetchSurveyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]); // Only depend on fetchKey, not the individual values

  const handleSubmit = useCallback(async () => {
    if (startingSurvey || !survey || loading) {
      return;
    }

    setStartingSurvey(true);
    setError(null);

    const filteredQuestions = questions.filter(
      (_, index) => !deletedQuestions.has(index)
    );
    const filteredSurvey = survey
      ? {
          ...survey,
          Questions: filteredQuestions,
        }
      : null;

    const questionIndices = questions
      .map((_, index) => index)
      .filter((index) => !deletedQuestions.has(index));

    try {
      let surveyRunId: string;

      if (deletedQuestions.size > 0) {
        try {
          surveyRunId = await startSurvey(survey.Id, questionIndices, {
            componentId: componentIdRef.current,
            setLoading: setStartingSurvey,
          });
        } catch (error) {
          // Ignore abort errors
          if (
            error instanceof Error &&
            (error.name === "AbortError" ||
              error.message === "Request canceled with cancel token")
          ) {
            return;
          }

          // Fallback: if POST doesn't work, try without questionIndices
          console.warn(
            "POST with questionIndices failed, falling back to default. Backend may need to support question filtering.",
            error
          );
          surveyRunId = await startSurvey(survey.Id, undefined, {
            componentId: componentIdRef.current,
            setLoading: setStartingSurvey,
          });
        }
      } else {
        // No deleted questions, use default
        surveyRunId = await startSurvey(survey.Id, undefined, {
          componentId: componentIdRef.current,
          setLoading: setStartingSurvey,
        });
      }

      // Check if component is still mounted before navigating
      if (!isMountedRef.current) {
        return;
      }

      const p1 = filteredSurvey?.PasswordOne;
      const p2 = filteredSurvey?.PasswordTwo;

      navigate(`/brand-rank/survey/${surveyRunId}/${p1}/${p2}`, {
        state: {
          query: effectiveQuery,
          selectedBrand: displayBrand,
          survey: filteredSurvey,
        },
      });
    } catch (error) {
      // Ignore abort errors
      if (
        error instanceof Error &&
        (error.name === "AbortError" ||
          error.message === "Request canceled with cancel token")
      ) {
        return;
      }

      console.error("Failed to start survey:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start survey. Please try again.";
      setError(errorMessage);
    } finally {
      if (isMountedRef.current) {
        setStartingSurvey(false);
      }
    }
  }, [
    startingSurvey,
    survey,
    loading,
    deletedQuestions,
    navigate,
    effectiveQuery,
    displayBrand,
  ]);

  const handleDeleteQuestion = (index: number) => {
    setConfirmingDelete(index);
  };

  const handleConfirmDelete = (index: number) => {
    const question = questions[index];
    if (question) {
      setLastDeletedQuestion({ index, question });
      setDeletedQuestions((prev) => new Set([...prev, index]));
      setShowToast(true);
      setConfirmingDelete(null);
    }
  };

  const handleRestoreQuestion = () => {
    if (lastDeletedQuestion) {
      setDeletedQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lastDeletedQuestion.index);
        return newSet;
      });
      setLastDeletedQuestion(null);
      setShowToast(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center mx-2 mt-10 mb-[7.5rem] gap-4"
    >
      <BrandSurveyRunSummary
        query={effectiveQuery}
        brand={displayBrand}
        survey={survey ?? null}
        handleSubmit={handleSubmit}
        startingSurvey={startingSurvey ?? false}
        deletedQuestions={deletedQuestions}
      />
      {loading && !survey && !error && (
        <>
          <h4 className="text-3xl font-light text-center">
            {selectedBrand
              ? "Now we're generating customer questions"
              : "Now we're generating similar questions"}
          </h4>
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent" />
        </>
      )}
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 max-w-[800px] w-full">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span className="font-medium">Error:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              // Trigger re-fetch by incrementing retry trigger
              setRetryTrigger((prev) => prev + 1);
            }}
            className="mt-2 px-4 py-2 text-sm font-medium text-red-800 dark:text-red-200 bg-red-100 dark:bg-red-900/40 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      {survey && (
        <div className="mt-3 w-full max-w-[800px] rounded-[1.25rem] border border-gray-200 dark:border-gray-700 overflow-hidden">
          {questions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No questions were returned for this survey.
            </div>
          ) : (
            <ul className="m-0 p-0 list-none">
              {questions.map((q, i) => {
                if (deletedQuestions.has(i)) return null;

                return (
                  <li
                    key={i}
                    className="p-2.5 w-full max-w-[800px] rounded-lg border-b border-gray-200 dark:border-gray-700 relative transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onMouseEnter={() => setHoveredQuestion(i)}
                    onMouseLeave={() => {
                      setHoveredQuestion(null);
                      if (confirmingDelete === i) {
                        setConfirmingDelete(null);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Number with fixed width */}
                      <div className="flex items-center gap-6">
                        <span className="font-normal min-w-[2rem] text-right text-[13px] leading-5">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        {/* Question text */}
                        <p className="text-sm w-[500px] leading-5 m-0">{q}</p>
                      </div>

                      {/* Trash icon or confirm button - fixed width container */}
                      <div className="min-w-[40px] flex justify-end items-end pr-3">
                        {hoveredQuestion === i && confirmingDelete !== i && (
                          <button
                            onClick={() => handleDeleteQuestion(i)}
                            className="p-2 rounded-full text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200"
                            aria-label="Delete question"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {confirmingDelete === i && (
                          <button
                            onClick={() => handleConfirmDelete(i)}
                            className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all duration-200 flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Confirm?
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
      {/* Toast notification for deleted question */}
      {showToast && (
        <div
          className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
          role="alert"
        >
          <div className="bg-[#1a1a1a] text-white rounded-[1.5rem] px-3 py-2 flex items-center gap-2 min-w-[320px] max-w-[400px] shadow-xl">
            {/* Left side - Trash icon and text */}
            <div className="flex items-center gap-1.5 flex-1">
              <Trash2 size={16} className="text-red-500" />
              <span className="text-white text-sm font-medium">
                Question removed
              </span>
            </div>

            {/* Right side - Bring back button */}
            <button
              onClick={handleRestoreQuestion}
              className="flex items-center gap-1 bg-[#2a2a2a] text-white rounded-2xl px-2 py-1 text-xs font-medium hover:bg-[#3a3a3a] transition-colors duration-200"
            >
              <Undo2 size={14} />
              Bring back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
