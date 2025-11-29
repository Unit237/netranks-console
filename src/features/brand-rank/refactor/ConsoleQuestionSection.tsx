import { Check, MousePointerClick, Plus, Trash2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { BrandData, Question } from "../@types";
import {
  addQuestion,
  deleteQuestion,
  editQuestion,
} from "../services/brandService";

interface ConsoleQuestionSectionProps {
  survey: BrandData;
  onQuestionCountChange?: (count: number) => void;
  onQuestionsChange?: (questions: Question[]) => void;
}

const ConsoleQuestionSection: React.FC<ConsoleQuestionSectionProps> = ({
  survey,
  onQuestionCountChange,
  onQuestionsChange,
}) => {
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuestionInput, setEditQuestionInput] = useState("");
  const [questions, setQuestions] = useState<Question[]>(
    survey.Questions ?? []
  );
  const [deletedQuestions, setDeletedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<"delete" | "add">("delete");
  const [lastDeletedQuestion, setLastDeletedQuestion] = useState<{
    index: number;
    question: string;
  } | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus input when add question form is shown
  useEffect(() => {
    if (showAddQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddQuestion]);

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

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
        if (toastType === "delete") {
          setLastDeletedQuestion(null);
        }
      }, 4000);
    }
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [showToast, toastType]);

  // Update question count when questions or deletedQuestions change
  useEffect(() => {
    const activeQuestionCount = questions.length - deletedQuestions.size;
    onQuestionCountChange?.(activeQuestionCount);

    // Expose current questions (filtered to exclude deleted ones)
    const activeQuestions = questions.filter((_, index) => !deletedQuestions.has(index));
    onQuestionsChange?.(activeQuestions);
  }, [questions, deletedQuestions, onQuestionCountChange, onQuestionsChange]);

  const handleDeleteQuestion = (index: number) => {
    setConfirmingDelete(index);
  };

  const handleConfirmDelete = async (index: number) => {
    const question = questions[index];
    if (question) {
      try {
        await deleteQuestion(index.toString());

        setLastDeletedQuestion({ index, question: question.Text });
        setDeletedQuestions((prev) => new Set([...prev, index]));
        setToastType("delete");
        setShowToast(true);
        setConfirmingDelete(null);
      } catch (error) {
        console.error("Failed to delete question:", error);
      }
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

  const handleAddQuestion = async () => {
    const trimmedQuestion = newQuestionInput.trim();

    if (!trimmedQuestion) return;

    setIsSubmitting(true);

    try {
      const newQuestionId: number = await addQuestion(
        survey.Id,
        trimmedQuestion
      );

      if (newQuestionId) {
        setQuestions((prev) => [
          ...prev,
          { Id: newQuestionId, Text: trimmedQuestion },
        ]);
        setNewQuestionInput("");
        setShowAddQuestion(false);
        setToastType("add");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Failed to add question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = async (index: number) => {
    const trimmedQuestion = editQuestionInput.trim();

    if (!trimmedQuestion) return;

    setIsSubmitting(true);

    try {
      await editQuestion(index, trimmedQuestion);

      setQuestions((prev) => {
        const updated = [...prev];
        updated[index].Text = trimmedQuestion;
        return updated;
      });
      setEditingIndex(null);
      setEditQuestionInput("");
      setToastType("add");
      setShowToast(true);
    } catch (error) {
      console.error("Failed to edit question:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClickQuestion = (index: number, question: string) => {
    setEditingIndex(index);
    setEditQuestionInput(question);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditQuestionInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleAddQuestion();
    } else if (e.key === "Escape") {
      setShowAddQuestion(false);
      setNewQuestionInput("");
    }
  };

  const handleEditKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleEditQuestion(index);
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleCancelAdd = () => {
    setShowAddQuestion(false);
    setNewQuestionInput("");
  };

  return (
    <div className="border border-gray-200 bg-gray-100 rounded-[20px]">
      <div className="flex flex-col w-[35vw] h-full mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 p-6">
          <MousePointerClick className="h-4 w-4" />
          <h1>Click on a question to edit it</h1>
        </div>
        {survey && (
          <div className="">
            {questions.length === 0 && !showAddQuestion ? (
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
                      className=""
                      onMouseEnter={() => setHoveredQuestion(i)}
                      onMouseLeave={() => {
                        setHoveredQuestion(null);
                        if (confirmingDelete === i) {
                          setConfirmingDelete(null);
                        }
                      }}
                    >
                      {editingIndex === i ? (
                        <div className="flex items-start gap-3 w-full h-24 px-4 py-2">
                          <span className="font-normal min-w-[2rem] text-right text-[13px] leading-5 text-gray-600 dark:text-gray-400 mt-2">
                            {String(i + 1)}.
                          </span>
                          <div className="flex-1 flex flex-col gap-2">
                            <input
                              type="text"
                              value={editQuestionInput}
                              onChange={(e) =>
                                setEditQuestionInput(e.target.value)
                              }
                              onKeyDown={(e) => handleEditKeyPress(e, i)}
                              className="w-full px-3 py-2 text-sm bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-white focus:border-transparent"
                              disabled={isSubmitting}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={handleCancelEdit}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditQuestion(i)}
                                disabled={
                                  !editQuestionInput.trim() || isSubmitting
                                }
                                className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-black transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Check size={14} />
                                    Save
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full h-14 rounded-[20px] border bg-white border-gray-200 dark:border-gray-700 relative transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div
                            className="flex items-start gap-6 flex-1 cursor-pointer px-4"
                            onClick={() => handleClickQuestion(i, q.Text)}
                          >
                            <span className="font-normal min-w-[2rem] text-right text-[13px] leading-5 text-gray-600 dark:text-gray-400">
                              {String(i + 1)}.
                            </span>
                            <p className="text-sm w-[440px] leading-5 m-0 text-gray-900 dark:text-gray-100">
                              {q.Text}
                            </p>
                          </div>

                          <div className="flex justify-end items-end pr-3">
                            {hoveredQuestion === i &&
                              confirmingDelete !== i && (
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
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {showAddQuestion ? (
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-[20px] bg-white dark:bg-gray-800/50">
                <div className="flex items-start gap-3">
                  <span className="font-normal min-w-[2rem] text-right text-[13px] leading-5 text-gray-600 dark:text-gray-400 mt-2">
                    {String(questions.length + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newQuestionInput}
                      onChange={(e) => setNewQuestionInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Enter your question..."
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-white focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={handleCancelAdd}
                        disabled={isSubmitting}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddQuestion}
                        disabled={!newQuestionInput.trim() || isSubmitting}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-black rounded-lg hover:bg-black transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="w-full p-3 text-sm font-medium text-gray-500 hover:text-gray-600 bg-gray-100 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-950/30 transition-colors duration-200 flex items-center justify-center gap-2 border-b border-gray-200 dark:border-gray-700 rounded-b-[20px] overflow-hidden"
              >
                <Plus size={16} />
                Add Question
              </button>
            )}
          </div>
        )}

        {/* Toast notification */}
        {showToast && (
          <div
            className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300"
            role="alert"
          >
            <div className="bg-[#1a1a1a] text-white rounded-[1.5rem] px-3 py-2 flex items-center gap-2 min-w-[320px] max-w-[400px] shadow-xl">
              {toastType === "delete" ? (
                <>
                  <div className="flex items-center gap-1.5 flex-1">
                    <Trash2 size={16} className="text-red-500" />
                    <span className="text-white text-sm font-medium">
                      Question removed
                    </span>
                  </div>
                  <button
                    onClick={handleRestoreQuestion}
                    className="flex items-center gap-1 bg-[#2a2a2a] text-white rounded-2xl px-2 py-1 text-xs font-medium hover:bg-[#3a3a3a] transition-colors duration-200"
                  >
                    <Undo2 size={14} />
                    Bring back
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5 flex-1">
                  <Check size={16} className="text-green-500" />
                  <span className="text-white text-sm font-medium">
                    Question added successfully
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleQuestionSection;
