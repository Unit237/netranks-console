import type { Question as SurveyQuestion } from "../../@types";

interface QuestionPageTabProps {
  questions: SurveyQuestion[];
}

const QuestionPageTab: React.FC<QuestionPageTabProps> = ({ questions }) => {
  return (
    <div className="bg-gray-100 rounded-[20px] border border-gray-200">
      {questions.map((question, index) => (
        <div
          key={question.Id}
          className={`bg-white rounded-[20px] border border-gray-100 flex items-center justify-between px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors ${
            index !== questions.length - 1 ? "border-b border-gray-100" : ""
          }`}
          onClick={() => {}}
        >
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
        </div>
      ))}
    </div>
  );
};

export default QuestionPageTab;
