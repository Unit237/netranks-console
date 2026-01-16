import { Trash2, Undo2 } from "lucide-react";
import React from "react";

interface DeleteQuestionToastProps {
  handleRestoreQuestion: () => void;
}

const DeleteQuestionToast: React.FC<DeleteQuestionToastProps> = ({
  handleRestoreQuestion,
}) => {
  return (
    <div
      className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 px-3 sm:px-0 w-full sm:w-auto max-w-[calc(100%-1.5rem)] sm:max-w-none"
      role="alert"
    >
      <div className="bg-[#1a1a1a] text-white rounded-2xl sm:rounded-[1.5rem] px-2.5 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2 min-w-0 sm:min-w-[320px] sm:max-w-[400px] shadow-xl">
        {/* Left side - Trash icon and text */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
          <Trash2 size={14} className="text-red-500 flex-shrink-0 sm:hidden" />
          <Trash2
            size={16}
            className="text-red-500 flex-shrink-0 hidden sm:block"
          />
          <span className="text-white text-xs sm:text-sm font-medium truncate">
            Question removed
          </span>
        </div>

        {/* Right side - Bring back button */}
        <button
          onClick={handleRestoreQuestion}
          className="flex items-center gap-0.5 sm:gap-1 bg-[#2a2a2a] text-white rounded-xl sm:rounded-2xl px-2 py-1 text-[10px] sm:text-xs font-medium hover:bg-[#3a3a3a] transition-colors duration-200 flex-shrink-0 whitespace-nowrap"
        >
          <Undo2 size={12} className="sm:hidden" />
          <Undo2 size={14} className="hidden sm:block" />
          <span className="hidden xs:inline">Bring back</span>
          <span className="xs:hidden">Undo</span>
        </button>
      </div>
    </div>
  );
};

export default DeleteQuestionToast;
