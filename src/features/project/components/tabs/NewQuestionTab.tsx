import { AlertCircle, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ApiError } from "../../../../app/lib/api";
import { addQuestion, deleteQuestion } from "../../../brand-rank/services/brandService";
import type { Question as SurveyQuestion } from "../../@types";

interface QuestionPageTabProps {
  questions: SurveyQuestion[];
  surveyId: number;
  onQuestionsUpdate?: () => void;
}

const QuestionPageTab: React.FC<QuestionPageTabProps> = ({ 
  questions, 
  surveyId,
  onQuestionsUpdate 
}) => {
  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddQuestion = async () => {
    const trimmedQuestion = newQuestionInput.trim();

    if (!trimmedQuestion) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await addQuestion(surveyId, trimmedQuestion);
      
      // Refresh questions list
      if (onQuestionsUpdate) {
        onQuestionsUpdate();
      }
      
      setNewQuestionInput("");
      setShowAddQuestion(false);
    } catch (error) {
      console.error("Failed to add question:", error);
      if (error instanceof ApiError) {
        // Extract error message from API response
        let message = "Failed to add question";
        if (error.response) {
          if (typeof error.response === "string") {
            message = error.response;
          } else if (typeof error.response === "object") {
            const response = error.response as any;
            message = response.error || response.message || message;
          }
        } else if (error.message) {
          message = error.message;
        }
        setErrorMessage(message);
      } else {
        setErrorMessage("Failed to add question. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (questionId: number) => {
    setConfirmingDelete(questionId);
  };

  const handleConfirmDelete = async (questionId: number) => {
    setIsSubmitting(true);
    setDeletingQuestionId(questionId);
    setErrorMessage(null);

    try {
      await deleteQuestion(questionId.toString());
      
      // Refresh questions list
      if (onQuestionsUpdate) {
        onQuestionsUpdate();
      }
      
      setConfirmingDelete(null);
    } catch (error) {
      console.error("Failed to delete question:", error);
      if (error instanceof ApiError) {
        // Extract error message from API response
        let message = "Failed to delete question";
        if (error.response) {
          if (typeof error.response === "string") {
            message = error.response;
          } else if (typeof error.response === "object") {
            const response = error.response as any;
            message = response.error || response.message || message;
          }
        } else if (error.message) {
          message = error.message;
        }
        setErrorMessage(message);
        setConfirmingDelete(null);
      } else {
        setErrorMessage("Failed to delete question. Please try again.");
        setConfirmingDelete(null);
      }
    } finally {
      setIsSubmitting(false);
      setDeletingQuestionId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSubmitting && newQuestionInput.trim()) {
      handleAddQuestion();
    } else if (e.key === "Escape") {
      setShowAddQuestion(false);
      setNewQuestionInput("");
    }
  };

  return (
    <div className="bg-gray-100 rounded-[20px] border border-gray-200">
      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 m-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Add Question Section */}
      <div className="p-6 border-b border-gray-200">
        {!showAddQuestion ? (
          <button
            onClick={() => setShowAddQuestion(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            <Plus size={16} />
            Add Question
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newQuestionInput}
              onChange={(e) => setNewQuestionInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter your question..."
              className="w-full px-4 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              disabled={isSubmitting}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddQuestion}
                disabled={!newQuestionInput.trim() || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Question
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddQuestion(false);
                  setNewQuestionInput("");
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No questions yet. Add your first question above.
        </div>
      ) : (
        questions.map((question, index) => (
          <div
            key={question.Id}
            className={`bg-white rounded-[20px] border border-gray-100 transition-colors ${
              index !== questions.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-gray-400"
                >
                  <path
                    fill="currentColor"
                    d="M5.536 21.886a1 1 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A1 1 0 0 0 5 3v18a1 1 0 0 0 .536.886"
                  />
                </svg>
                <span className="text-gray-500 font-medium">{index + 1}</span>
                <span className="text-gray-900">{question.Text}</span>
              </div>
              <div className="flex items-center gap-2">
                {confirmingDelete === question.Id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Delete?</span>
                    <button
                      onClick={() => handleConfirmDelete(question.Id)}
                      disabled={isSubmitting}
                      className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Yes
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      disabled={isSubmitting}
                      className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteClick(question.Id)}
                    disabled={isSubmitting || deletingQuestionId === question.Id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete question"
                  >
                    {deletingQuestionId === question.Id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionPageTab;
