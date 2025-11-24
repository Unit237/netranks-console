import { Trash2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const {
    selectedBrand,
    setSelectedBrand,
    query,
    setQuery: setQueryState,
  } = useBrand();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  const questions = survey?.Questions ?? [];
  const effectiveQuery = hasParamQuestion ? paramQuestionRaw : query;
  const displayBrand = hasParamQuestion ? null : selectedBrand ?? null;

  useEffect(() => {
    // Validate that we have data to fetch
    if (!hasParamQuestion && !selectedBrand && !query) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        let surveyData: BrandData;

        if (hasParamQuestion) {
          surveyData = await fetchQueryQuestions(paramQuestionRaw);
        } else if (selectedBrand) {
          surveyData = await fetchBrandQuestions(selectedBrand);
        } else if (query) {
          surveyData = await fetchQueryQuestions(query);
        } else {
          throw new Error("No data available to fetch survey");
        }

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
          // setQueryState("");
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
    hasParamQuestion,
    paramQuestionRaw,
    selectedBrand,
    query,
    navigate,
    setSelectedBrand,
    setQueryState,
  ]);

  // Handle click outside to cancel confirmation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setConfirmingDelete(null);
      }
    };

    if (confirmingDelete !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [confirmingDelete]);

  const handleSubmit = async () => {
    if (startingSurvey || !survey) {
      return;
    }

    setStartingSurvey(true);
    setError(null);

    // Filter out deleted questions
    const filteredQuestions =
      survey?.Questions?.filter((_, index) => !deletedQuestions.has(index)) ??
      [];
    const filteredSurvey = survey
      ? {
          ...survey,
          Questions: filteredQuestions,
        }
      : null;

    // Get question indices (0-based) to include only non-deleted questions
    const questionIndices =
      survey?.Questions?.map((_, index) => index).filter(
        (index) => !deletedQuestions.has(index)
      ) ?? [];

    try {
      let surveyRunId: string;

      if (deletedQuestions.size > 0) {
        try {
          // Attempt to start survey with filtered question indices
          surveyRunId = await startSurvey(survey.Id, questionIndices);
        } catch (error) {
          // Fallback: if POST doesn't work, try GET (backend might not support filtering yet)
          console.warn(
            "POST with questionIndices failed, falling back to GET. Backend may need to support question filtering.",
            error
          );
          surveyRunId = await startSurvey(survey.Id);
        }
      } else {
        // No deleted questions, use GET
        surveyRunId = await startSurvey(survey.Id);
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
      console.error("Failed to start survey:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start survey. Please try again.";
      setError(errorMessage);
    } finally {
      setStartingSurvey(false);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    setConfirmingDelete(index);
  };

  const handleConfirmDelete = (index: number) => {
    const question = survey?.Questions?.[index];
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
          <h4 className="text-xl font-light text-center">
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
              // Trigger re-fetch by updating state
              if (hasParamQuestion) {
                // Force re-render by updating search params
                window.location.reload();
              } else {
                // Re-trigger useEffect by updating a dependency
                setSurvey(null);
              }
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
